
import apiClient from './apiClient';
import { Equipment, MaintenanceTicket, User, EquipmentStatus, Branch } from '../types';

export const tenantApi = {
  getEquipments: async (companyId: string): Promise<Equipment[]> => {
    const response = await apiClient.get('/v1/equipamentos', {
      headers: { 'X-Company-Id': companyId }
    });
    return response.data.data;
  },

  getMaintenanceTickets: async (companyId: string): Promise<MaintenanceTicket[]> => {
    const response = await apiClient.get('/v1/chamados', {
      headers: { 'X-Company-Id': companyId }
    });
    return response.data.data;
  },

  getUsers: async (companyId: string): Promise<User[]> => {
    const response = await apiClient.get('/v1/usuarios', {
      headers: { 'X-Company-Id': companyId }
    });
    return response.data.data;
  },

  getEquipmentStatuses: async (companyId: string): Promise<EquipmentStatus[]> => {
    const response = await apiClient.get('/v1/estados_equipamento', {
      headers: { 'X-Company-Id': companyId }
    });
    return response.data.data;
  },

  getBranches: async (companyId: string): Promise<Branch[]> => {
    const response = await apiClient.get('/v1/filiais', {
      headers: { 'X-Company-Id': companyId }
    });
    return response.data.data;
  }
};
