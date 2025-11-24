
import apiClient from './apiClient';
import { Company, Transaction, User, ApiResponse, AuthResponse } from '../types';

export const masterApi = {
  // Autenticação Master
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/master/v1/auth/login', { email, password });
    return response.data.data;
  },

  getCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<ApiResponse<Company[]>>('/master/v1/empresas');
    return response.data.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>('/master/v1/pagamentos');
    return response.data.data;
  },

  getAdminUsers: async (): Promise<User[]> => {
    // Endpoint para buscar administradores do sistema
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/master/v1/usuarios');
      return response.data.data || [];
    } catch (error) {
      console.warn('Erro ao buscar usuários master, retornando vazio.', error);
      return [];
    }
  },

  toggleCompanyStatus: async (id: string, action: 'suspender' | 'reativar'): Promise<void> => {
    await apiClient.post(`/master/v1/empresas/${id}/${action}`);
  }
};
