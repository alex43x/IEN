import api from './api';
import {
  AdminMetrics,
  PaginacionPacientes,
  PerfilPaciente,
  ProgresoPaciente,
  TestInicialResponse,
  DiasPlanResponse,
  ReportesUsuarios,
  GraficaSemanal,
  Sucursal,
  ProductoAdmin,
  CodigoActivacion,
  CreateAdminNegocioRequest,
  CreateAdminNegocioResponse,
  AdminNegocioItem,
  UpdateAdminNegocioRequest,
  CreateModeradorRequest,
  CreateModeradorResponse,
  ModeradorTiendaItem,
  UpdateModeradorRequest,
  CodigoResponse,
} from '../types/api.types';

export const adminService = {
  getMetrics: async () => {
    const response = await api.get<AdminMetrics[]>('/admin/dashboard/metrics');
    return response.data;
  },

  listarPacientes: async (page = 1, limit = 20) => {
    const response = await api.get<PaginacionPacientes>('/admin/pacientes', { params: { page, limit } });
    return response.data;
  },

  perfilPaciente: async (usuarioId: string) => {
    const response = await api.get<PerfilPaciente>(`/admin/pacientes/${usuarioId}/perfil`);
    return response.data;
  },

  progresoPaciente: async (usuarioId: string) => {
    const response = await api.get<ProgresoPaciente>(`/admin/pacientes/${usuarioId}/progreso`);
    return response.data;
  },

  testInicialPaciente: async (usuarioId: string) => {
    const response = await api.get<TestInicialResponse>(`/admin/pacientes/${usuarioId}/test-inicial`);
    return response.data;
  },

  actividadesPaciente: async (usuarioId: string) => {
    const response = await api.get<DiasPlanResponse>(`/admin/pacientes/${usuarioId}/actividades`);
    return response.data;
  },

  reportesUsuarios: async () => {
    const response = await api.get<ReportesUsuarios>('/admin/reportes/usuarios');
    return response.data;
  },

  graficaSemanal: async () => {
    const response = await api.get<GraficaSemanal[]>('/admin/reportes/usuarios/grafica-semanal');
    return response.data;
  },

  crearAdminNegocio: async (data: CreateAdminNegocioRequest) => {
    const response = await api.post<CreateAdminNegocioResponse>('/admin/usuarios/admin-negocio', data);
    return response.data;
  },

  listarAdminsNegocio: async () => {
    const response = await api.get<AdminNegocioItem[]>('/admin/usuarios/admin-negocio');
    return response.data;
  },

  getAdminNegocio: async (id: string) => {
    const response = await api.get<AdminNegocioItem>(`/admin/usuarios/admin-negocio/${id}`);
    return response.data;
  },

  actualizarAdminNegocio: async (id: string, data: UpdateAdminNegocioRequest) => {
    const response = await api.put<AdminNegocioItem>(`/admin/usuarios/admin-negocio/${id}`, data);
    return response.data;
  },

  eliminarAdminNegocio: async (id: string) => {
    const response = await api.delete<{ mensaje: string }>(`/admin/usuarios/admin-negocio/${id}`);
    return response.data;
  },

  listarModeradores: async () => {
    const response = await api.get<ModeradorTiendaItem[]>('/admin/usuarios/moderador-tienda');
    return response.data;
  },

  crearModerador: async (data: CreateModeradorRequest) => {
    const response = await api.post<CreateModeradorResponse>('/admin/usuarios/moderador-tienda', data);
    return response.data;
  },

  getModerador: async (id: string) => {
    const response = await api.get<ModeradorTiendaItem>(`/admin/usuarios/moderador-tienda/${id}`);
    return response.data;
  },

  actualizarModerador: async (id: string, data: UpdateModeradorRequest) => {
    const response = await api.put<ModeradorTiendaItem>(`/admin/usuarios/moderador-tienda/${id}`, data);
    return response.data;
  },

  eliminarModerador: async (id: string) => {
    const response = await api.delete<{ mensaje: string }>(`/admin/usuarios/moderador-tienda/${id}`);
    return response.data;
  },

  listarSucursales: async (incluirInactivas?: boolean) => {
    const response = await api.get<Sucursal[]>('/admin/sucursales', {
      params: incluirInactivas ? { incluir_inactivas: 'true' } : undefined,
    });
    return response.data;
  },

  crearSucursal: async (data: { nombre_tienda: string; ciudad: string }) => {
    const response = await api.post<Sucursal>('/admin/sucursales', data);
    return response.data;
  },

  actualizarSucursal: async (id: string, data: { nombre_tienda: string; ciudad: string }) => {
    const response = await api.put<Sucursal>(`/admin/sucursales/${id}`, data);
    return response.data;
  },

  eliminarSucursal: async (id: string) => {
    const response = await api.delete<{ mensaje: string }>(`/admin/sucursales/${id}`);
    return response.data;
  },

  reactivarSucursal: async (id: string) => {
    const response = await api.patch<{ mensaje: string }>(`/admin/sucursales/${id}/reactivar`);
    return response.data;
  },

  listarProductos: async () => {
    const response = await api.get<ProductoAdmin[]>('/admin/productos');
    return response.data;
  },

  crearProducto: async (data: { nombre: string; descripcion?: string; tiendas: string[] }) => {
    const response = await api.post<ProductoAdmin>('/admin/productos', data);
    return response.data;
  },

  actualizarProducto: async (id: string, data: { nombre?: string; descripcion?: string; tiendas?: string[] }) => {
    const response = await api.put<ProductoAdmin>(`/admin/productos/${id}`, data);
    return response.data;
  },

  eliminarProducto: async (id: string) => {
    const response = await api.delete<{ mensaje: string }>(`/admin/productos/${id}`);
    return response.data;
  },

  listarCodigos: async () => {
    const response = await api.get<CodigoActivacion[]>('/admin/codigos');
    return response.data;
  },

  crearCodigo: async (data: { codigo: string; producto_id: string; tienda_id: string }) => {
    const response = await api.post<CodigoActivacion>('/admin/codigos', data);
    return response.data;
  },

  activarCodigo: async (id: string) => {
    const response = await api.patch<CodigoResponse>(`/admin/codigos/${id}/activar`);
    return response.data;
  },

  desactivarCodigo: async (id: string) => {
    const response = await api.patch<CodigoResponse>(`/admin/codigos/${id}/desactivar`);
    return response.data;
  },
};
