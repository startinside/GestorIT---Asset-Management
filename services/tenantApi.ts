import apiClient from './apiClient';
import {
  Equipment,
  MaintenanceTicket,
  User,
  EquipmentStatus,
  Branch,
  ApiResponse,
  AuthResponse,
} from '../types';

export const tenantApi = {
  // ----------------------------------------------------
  // Autenticação (Tenant)
  // ----------------------------------------------------
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/v1/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  // ----------------------------------------------------
  // Metadados: Filiais, Estados de equipamento
  // ----------------------------------------------------
  getBranches: async (companyId: string): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(
      '/v1/filiais',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  getEquipmentStatuses: async (
    companyId: string
  ): Promise<EquipmentStatus[]> => {
    const response = await apiClient.get<ApiResponse<EquipmentStatus[]>>(
      '/v1/estados_equipamento',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // ----------------------------------------------------
  // Usuários do Tenant (empresa)
  // ----------------------------------------------------
  // Listar usuários da empresa (tenant)
  getUsers: async (companyId: string): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      '/v1/usuarios',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data ?? [];
  },

  // Criar usuário
  createUser: async (
    companyId: string,
    payload: Partial<User>
  ): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      '/v1/usuarios',
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Atualizar usuário
  updateUser: async (
    companyId: string,
    userId: string,
    payload: Partial<User>
  ): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/v1/usuarios/${userId}`,
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Suspender/Reativar usuário
  suspendUser: async (
    companyId: string,
    userId: string,
    active: boolean
  ): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `/v1/usuarios/${userId}/suspender`,
      { active },
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Excluir usuário
  deleteUser: async (
    companyId: string,
    userId: string
  ): Promise<void> => {
    await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/v1/usuarios/${userId}`,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
  },

  // Avatar
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<
      ApiResponse<{ url: string }>
    >('/v1/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },


  // ----------------------------------------------------
  // Equipamentos
  // ----------------------------------------------------
  // Listar equipamentos da empresa
  getEquipments: async (companyId: string): Promise<Equipment[]> => {
    const response = await apiClient.get<ApiResponse<Equipment[]>>(
      '/v1/equipamentos',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Criar novo equipamento
  createEquipment: async (
    companyId: string,
    payload: Partial<Equipment>
  ): Promise<Equipment> => {
    const response = await apiClient.post<ApiResponse<Equipment>>(
      '/v1/equipamentos',
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Atualizar equipamento
  updateEquipment: async (
    companyId: string,
    equipmentId: string,
    payload: Partial<Equipment>
  ): Promise<Equipment> => {
    const response = await apiClient.patch<ApiResponse<Equipment>>(
      `/v1/equipamentos/${equipmentId}`,
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Suspender/Reativar equipamento
  suspendEquipment: async (
    companyId: string,
    equipmentId: string,
    active: boolean
  ): Promise<Equipment> => {
    const response = await apiClient.post<ApiResponse<Equipment>>(
      `/v1/equipamentos/${equipmentId}/suspender`,
      { active },
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Excluir equipamento
  deleteEquipment: async (
    companyId: string,
    equipmentId: string
  ): Promise<void> => {
    await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/v1/equipamentos/${equipmentId}`,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
  },

  duplicateEquipment: async (companyId: string, equipmentId: string) => {
    const response = await apiClient.post<ApiResponse<Equipment>>(
      `/v1/equipamentos/${equipmentId}/duplicar`,
      {},
      { headers: { 'X-Company-Id': companyId } }
    );
    return response.data.data;
  },

  // ----------------------------------------------------
  // Chamados de manutenção / Kanban
  // ----------------------------------------------------
  // Listar chamados
  getMaintenanceTickets: async (
    companyId: string
  ): Promise<MaintenanceTicket[]> => {
    const response = await apiClient.get<ApiResponse<MaintenanceTicket[]>>(
      '/v1/chamados',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Criar novo chamado
  createTicket: async (
    companyId: string,
    payload: Partial<MaintenanceTicket>
  ): Promise<MaintenanceTicket> => {
    const response = await apiClient.post<ApiResponse<MaintenanceTicket>>(
      '/v1/chamados',
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Atualizar coluna Kanban do chamado
  moveTicket: async (
    companyId: string,
    ticketId: string,
    newStatus: MaintenanceTicket['kanbanStatus']
  ): Promise<MaintenanceTicket> => {
    const response = await apiClient.patch<ApiResponse<MaintenanceTicket>>(
      `/v1/chamados/${ticketId}/kanban`,
      { kanbanStatus: newStatus },
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },
};
