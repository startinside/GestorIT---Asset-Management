
import apiClient from './apiClient';
import { Company, Transaction, User } from '../types';

export const masterApi = {
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get('/master/v1/empresas');
    // O backend retorna { data: [...], meta: ... }
    // Se apiClient não desestruturar automaticamente, acessamos response.data.data
    return response.data.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get('/master/v1/pagamentos');
    return response.data.data;
  },

  getAdminUsers: async (): Promise<User[]> => {
    // Endpoint simulado no backend ou retornando vazio por enquanto se não houver tabela de usuários master separada
    // Para evitar erro 404 se não implementado, vamos assumir que o backend tem esse endpoint ou retorna vazio.
    // Vou implementar no backend para garantir.
    try {
      const response = await apiClient.get('/master/v1/usuarios');
      return response.data.data;
    } catch (e) {
      console.warn('Endpoint /master/v1/usuarios não disponível, retornando vazio.');
      return [];
    }
  }
};
