# IEN — Despliegue en Railway

Plataforma IEN (Inteligencia Emocional). 4 contenedores: Backend, Frontend, MongoDB y Seeder.

## Estructura

```
├── back/          → Backend API (Node.js + Express)
├── frontend/      → SPA (React + Nginx)
├── seeder/        → Carga inicial de datos (run-once)
└── docker-compose.yml
```

## Despliegue en Railway

### 1. Subir a GitHub

```bash
cd C:\Users\azufr\Desktop\IEN
git init
git add .
git commit -m "feat: IEN platform"
git remote add origin https://github.com/TU_USUARIO/ien.git
git branch -M main
git push -u origin main
```

### 2. Crear proyecto en Railway

Ir a [railway.com/new](https://railway.com/new) → **Empty Project** → renombrar a `IEN-Production`

### 3. Agregar MongoDB

**+ New** → **Database** → **MongoDB**

### 4. Backend

1. **+ New** → **GitHub Repo** → seleccionar `ien`
2. **Settings** → Root Directory: `back`
3. **Variables**:
   - `MONGO_URI` = `${{MongoDB.MONGO_URL}}`
   - `JWT_SECRET` = (generar con `openssl rand -hex 32`)
   - `CRON_API_KEY` = (generar con `openssl rand -hex 32`)
   - `RESEND_API_KEY` = (tu key de Resend)
   - `EMAIL_FROM` = (tu email)
   - `FRONTEND_URL` = (URL del frontend, paso 5)
4. **Settings** → Networking → Puerto: `3000`
5. Generar dominio público

### 5. Frontend

1. **+ New** → **GitHub Repo** → mismo repo
2. **Settings** → Root Directory: `frontend`
3. **Settings** → Networking → Puerto: `80`
4. Generar dominio público → copiar URL
5. Volver al backend y pegar la URL en `FRONTEND_URL`

### 6. Seeder

1. **+ New** → **GitHub Repo** → mismo repo
2. **Settings** → Root Directory: `seeder`
3. **Variables**: `MONGO_URI` = `${{MongoDB.MONGO_URL}}`
4. **Settings** → Deploy → desactivar **Auto Deploy**
5. Click **Deploy** una sola vez
6. Verificar en logs que el seed se complete

### 7. Verificar

Abrir la URL del frontend → ir a `/login`

## Testing local

```bash
cp .env.example .env
# Editar .env con valores reales
docker compose up --build
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:3000/api`
- MongoDB: `mongodb://localhost:27017/ien`

## Variables de entorno

| Variable        | Servicio  | Descripción                         |
|-----------------|-----------|-------------------------------------|
| MONGO_URI       | backend   | URL de conexión a MongoDB           |
| JWT_SECRET      | backend   | Secreto para tokens JWT             |
| CRON_API_KEY    | backend   | API key para cron jobs              |
| RESEND_API_KEY  | backend   | API key de Resend                   |
| EMAIL_FROM      | backend   | Email remitente                     |
| FRONTEND_URL    | backend   | URL pública del frontend (CORS)     |
| MONGO_URL       | seeder    | URL de MongoDB (inyectada por Railway) |
