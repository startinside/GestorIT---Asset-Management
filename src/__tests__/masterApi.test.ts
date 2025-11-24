
import { describe, it, expect, vi } from 'vitest';
import { masterApi } from '../../services/masterApi';
import apiClient from '../../services/apiClient';

vi.mock('../../services/apiClient');

describe('masterApi', () => {
  it('getCompanies calls correct endpoint', async () => {
    (apiClient.get as any).mockResolvedValue({ data: { data: [] } });
    await masterApi.getCompanies();
    expect(apiClient.get).toHaveBeenCalledWith('/master/v1/empresas');
  });
});
