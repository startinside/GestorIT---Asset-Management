import apiClient from './apiClient';
import {
  Company,
  Transaction,
  User,
  ApiResponse,
  AuthResponse,
} from '../types';

export const masterApi = {
  // Autenticação Master (SaaS)
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/master/v1/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  // Criar nova empresa (Painel Master)
  createCompany: async (
    payload: Partial<Company>
  ): Promise<Company> => {
    const response = await apiClient.post<ApiResponse<Company>>(
      '/master/v1/empresas',
      payload
    );
    return response.data.data;
  },

  // Atualizar empresa (opcional, já preparado)
  updateCompany: async (
    id: string,
    payload: Partial<Company>
  ): Promise<Company> => {
    const response = await apiClient.patch<ApiResponse<Company>>(
      `/master/v1/empresas/${id}`,
      payload
    );
    return response.data.data;
  },

  // Listagem de empresas
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<ApiResponse<Company[]>>(
      '/master/v1/empresas'
    );
    return response.data.data;
  },

  // Histórico financeiro / transações
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      '/master/v1/pagamentos'
    );
    return response.data.data;
  },

  // Usuários do painel master (opcional)
  getAdminUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>(
        '/master/v1/usuarios'
      );
      return response.data.data || [];
    } catch (error) {
      console.warn(
        'Erro ao buscar usuários master, retornando lista vazia.',
        error
      );
      return [];
    }
  },

  // Alterar status da empresa (suspender / reativar)
  toggleCompanyStatus: async (
    id: string,
    action: 'suspender' | 'reativar'
  ): Promise<void> => {
    await apiClient.post(`/master/v1/empresas/${id}/${action}`);
  },
};
