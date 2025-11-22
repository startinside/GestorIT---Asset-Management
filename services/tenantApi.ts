
import apiClient from './apiClient';
import { Equipment, MaintenanceTicket, User, EquipmentStatus, Branch } from '../types';
import { MOCK_EQUIPMENT, MOCK_TICKETS, MOCK_USERS, MOCK_STATUSES, MOCK_BRANCHES } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const tenantApi = {
  getEquipments: async (companyId: string): Promise<Equipment[]> => {
    // TODO: Replace with: await apiClient.get(`/v1/equipamentos`, { headers: { 'X-Company-Id': companyId } });
    await delay(600);
    return MOCK_EQUIPMENT.filter(e => e.companyId === companyId);
  },

  getMaintenanceTickets: async (companyId: string): Promise<MaintenanceTicket[]> => {
    // TODO: Replace with: await apiClient.get(`/v1/chamados`);
    await delay(600);
    return MOCK_TICKETS.filter(t => t.companyId === companyId);
  },

  getUsers: async (companyId: string): Promise<User[]> => {
    // TODO: Replace with: await apiClient.get(`/v1/usuarios`);
    await delay(600);
    // Na mock data não temos companyId explicito no usuario, retornando todos que não são superadmin para demo
    return MOCK_USERS.filter(u => u.role !== 'superadmin_sistema');
  },

  getEquipmentStatuses: async (companyId: string): Promise<EquipmentStatus[]> => {
    // TODO: Replace with: await apiClient.get(`/v1/estados_equipamento`);
    await delay(400);
    return MOCK_STATUSES.filter(s => s.companyId === companyId || s.companyId === 'global');
  },

  getBranches: async (companyId: string): Promise<Branch[]> => {
    // TODO: Replace with: await apiClient.get(`/v1/filiais`);
    await delay(400);
    return MOCK_BRANCHES.filter(b => b.companyId === companyId);
  }
};
