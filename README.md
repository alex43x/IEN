# IEN — Despliegue en Northflank

Plataforma IEN (Inteligencia Emocional).

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Frontend        │────▶│  Backend API    │────▶│  Northflank     │
│  (Static Site)   │     │  (Docker)       │     │  Addon (MongoDB)│
│  Northflank      │     │  Northflank     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| Servicio   | Plataforma     | Costo  |
|------------|----------------|--------|
| Frontend   | Northflank Static | Gratis |
| Backend    | Northflank Docker | Gratis |
| MongoDB    | Northflank Addon | Según plan |
| Seeder     | CLI manual     | -      |

## Paso 1 — Base de datos (Northflank Addon)

1. En el proyecto Northflank → **Add-ons** → **Add Add-on**
2. Seleccionar **MongoDB**
3. Elegir plan (dev o producción según necesidad)
4. Una vez creado, el addon inyecta automáticamente la variable `MONGO_URI` en los servicios vinculados
5. Si necesitás la URI fuera de Northflank, la encontrás en **Add-ons** → tu addon → **Credentials**

## Paso 2 — Northflank (backend + frontend)

1. Ir a [northflank.com](https://northflank.com) → crear cuenta con GitHub
2. Conectar el repositorio
3. Crear proyecto: **New Project** → nombre `ien`

### Backend (Docker Service)

En el proyecto → **New Service** → **Deploy from GitHub**:

| Campo | Valor |
|-------|-------|
| **Service Type** | Docker |
| **Repository** | Tu fork/repo |
| **Build Context** | `/back` |
| **Dockerfile Path** | `Dockerfile` |
| **Port** | `3000` |
| **Health Check Path** | `/health` |

Variables de entorno:

| Variable | Valor |
|----------|-------|
| `MONGO_URI` | Inyectada automáticamente por el addon (no requiere configurarla manualmente) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `CRON_API_KEY` | `openssl rand -hex 32` |
| `RESEND_API_KEY` | API key de resend.com |
| `EMAIL_FROM` | Tu email de envio |
| `FRONTEND_URL` | URL del frontend (proximo paso) |
| `PORT` | `3000` |

### Frontend (Static Site)

En el proyecto → **New Service** → **Deploy from GitHub**:

| Campo | Valor |
|-------|-------|
| **Service Type** | Static |
| **Repository** | Tu fork/repo |
| **Build Path** | `/frontend` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

Variables de entorno (build):

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://TU_BACKEND_URL.northflank.app/api` |

La URL del backend la obtienes del dashboard de Northflank una vez desplegado.

Una vez desplegado el frontend, volver al backend y actualizar `FRONTEND_URL` con la URL del frontend.

## Paso 3 — Ejecutar el Seeder

1. En Northflank → ir al servicio **backend**
2. Pestaña **Logs** o **Terminal**
3. Ejecutar:
   ```bash
   node src/seed.js
   ```
4. Verificar que diga "Seed completado" o similar
5. **Importante**: Esto solo se ejecuta una vez

## Paso 5 — Cron Jobs (Northflank)

Configurar 2 cron jobs en **Cron Jobs** → **Create new job**:

| Job | Horario (UTC) | Endpoint | Descripción |
|-----|:-------------:|----------|-------------|
| `ien-reminders` | `0 13 * * *` | `POST /api/jobs/send-reminders` | Recordatorio matutino (10:00 PY) a usuarios que no completaron el día anterior |
| `ien-daily` | `0 3 * * *` | `POST /api/jobs/run-daily` | Tareas nocturnas (00:00 PY): reset de rachas + nudges de activación + emails de recuperación |

Ambos cron jobs comparten estas variables de entorno:

| Variable | Valor |
|----------|-------|
| `CRON_API_KEY` | Misma que la del backend |
| `BACKEND_URL` | `https://TU_BACKEND_URL.northflank.app` |

**Source**: External image → `docker.io/curlimages/curl:latest`

**CMD override**:
```
sh -c 'curl -sS -X POST -H "X-API-KEY: $CRON_API_KEY" $BACKEND_URL/api/jobs/run-daily'
```
(Cambiar `run-daily` por `send-reminders` según el job.)

**Endpoints disponibles** (protegidos con `X-API-KEY`):

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/api/jobs/run-daily` | Cron `ien-daily` (00:00 PY) |
| `POST` | `/api/jobs/send-reminders` | Cron `ien-reminders` (10:00 PY) |
| `POST` | `/api/jobs/reset-streaks` | Manual / respaldo |
| `POST` | `/api/jobs/send-activation-nudge` | Manual / respaldo |
| `POST` | `/api/jobs/send-recovery` | Manual / respaldo |

## Paso 6 — Verificar

1. Abrir la URL del frontend
2. Ir a `/login`
3. El seeder crea un admin por defecto — credenciales en `back/src/seed.js`

## Notas importantes

- **Free tier**: Northflank da 2 servicios gratis + static sites. Este proyecto usa 1 Docker (backend) + 1 Static (frontend)
- **MongoDB Addon**: La base de datos se gestiona desde el addon de Northflank. No requiere configuración manual de URIs ni IP whitelist
- **Auto-deploy**: Northflank puede configurarse para desplegar automaticamente en cada push

## Testing local

```bash
cp .env.example .env
# Editar .env con valores reales
docker compose up --build
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:3000/api`
- MongoDB: `mongodb://localhost:27017/ien`
