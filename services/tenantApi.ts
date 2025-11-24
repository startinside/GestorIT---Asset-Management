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
  // Autenticação da empresa (Tenant)
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/v1/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  // Equipamentos da empresa
  getEquipments: async (companyId: string): Promise<Equipment[]> => {
    const response = await apiClient.get<ApiResponse<Equipment[]>>(
      '/v1/equipamentos',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },

  // Chamados de manutenção
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

  // Usuários da empresa (se precisar)
  getUsers: async (companyId: string): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/v1/usuarios', {
      headers: { 'X-Company-Id': companyId },
    });
    return response.data.data;
  },

  // Estados de equipamento
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

  // Filiais
  getBranches: async (companyId: string): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(
      '/v1/filiais',
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return response.data.data;
  },
};
