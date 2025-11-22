
// __tests__/masterApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../services/apiClient';
import { masterApi } from '../services/masterApi';

// Mock do módulo apiClient inteiro
vi.mock('../services/apiClient');

describe('masterApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCompanies deve chamar a API correta e retornar dados', async () => {
    const mockData = [{ id: 'c1', name: 'Empresa Teste' }];
    
    // Simulando a resposta do axios: { data: { data: [...] } }
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: mockData
      }
    });

    const result = await masterApi.getCompanies();

    expect(apiClient.get).toHaveBeenCalledWith('/master/v1/empresas');
    expect(result).toEqual(mockData);
  });

  it('getTransactions deve chamar a API correta', async () => {
    const mockTrans = [{ id: 't1', amount: 1000 }];
    (apiClient.get as any).mockResolvedValue({
      data: { data: mockTrans }
    });

    const result = await masterApi.getTransactions();
    expect(apiClient.get).toHaveBeenCalledWith('/master/v1/pagamentos');
    expect(result).toEqual(mockTrans);
  });
});
