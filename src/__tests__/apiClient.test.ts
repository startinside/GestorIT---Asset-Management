
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar instância com configuração correta', async () => {
    const mockCreate = vi.fn(() => ({
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
    }));
    (axios.create as any) = mockCreate;

    await import('../../services/apiClient');
    
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: expect.stringContaining('http'),
      headers: { 'Content-Type': 'application/json' }
    }));
  });
});
