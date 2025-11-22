
import apiClient from './apiClient';
import { Company, Transaction, User } from '../types';
import { MOCK_COMPANIES, MOCK_TRANSACTIONS, MOCK_USERS } from './mockData';

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const masterApi = {
  getCompanies: async (): Promise<Company[]> => {
    // TODO: Replace with: await apiClient.get('/master/v1/empresas');
    await delay(500); 
    return [...MOCK_COMPANIES];
  },

  getTransactions: async (): Promise<Transaction[]> => {
    // TODO: Replace with: await apiClient.get('/master/v1/financeiro');
    await delay(500);
    return [...MOCK_TRANSACTIONS];
  },

  getAdminUsers: async (): Promise<User[]> => {
    // TODO: Replace with: await apiClient.get('/master/v1/usuarios');
    await delay(500);
    return MOCK_USERS.filter(u => u.role === 'superadmin_sistema');
  }
};
