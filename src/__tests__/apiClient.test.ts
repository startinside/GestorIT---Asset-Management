
// __tests__/apiClient.test.ts
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// IMPORTANTE: mock do axios deve vir ANTES de importar o apiClient
vi.mock('axios');

describe('apiClient', () => {
  const mockedAxios = axios as unknown as { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar uma instância do axios com baseURL e headers padrões', async () => {
    // Vamos simular que axios.create retorna um objeto básico com interceptors
    const mockInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    } as any;

    (mockedAxios.create as any).mockReturnValue(mockInstance);

    // Importamos o apiClient DEPOIS de configurar o mock do axios.create
    const apiClient = (await import('../../services/apiClient')).default;

    // Verifica se axios.create foi chamado com as config esperadas
    expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    const configArg = (mockedAxios.create as any).mock.calls[0][0];

    expect(configArg).toEqual(
      expect.objectContaining({
        baseURL: expect.any(String), // aqui você pode ser mais específico se quiser
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    // Só pra garantir que a instância retornada é a mesma que simulamos
    expect(apiClient).toBe(mockInstance);
  });

  it('deve logar warning em respostas 401 (Unauthorized)', async () => {
    const mockUse = vi.fn();
    const mockInstance = {
      interceptors: {
        response: {
          use: mockUse,
        },
      },
    } as any;

    (mockedAxios.create as any).mockReturnValue(mockInstance);

    // Spy nos consoles
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Importa apiClient (irá registrar o interceptor)
    await import('../../services/apiClient');
    expect(mockUse).toHaveBeenCalledTimes(1);

    const [, errorInterceptor] = mockUse.mock.calls[0];

    const fakeError = {
      response: { status: 401 },
      message: 'Unauthorized',
    };

    await expect(errorInterceptor(fakeError)).rejects.toEqual(fakeError);

    expect(warnSpy).toHaveBeenCalledWith(
      'Unauthorized access - redirecting to login...'
    );
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('deve logar warning em respostas 403 (Forbidden)', async () => {
    const mockUse = vi.fn();
    const mockInstance = {
      interceptors: {
        response: {
          use: mockUse,
        },
      },
    } as any;

    (mockedAxios.create as any).mockReturnValue(mockInstance);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../../services/apiClient');
    const [, errorInterceptor] = (mockUse.mock.calls[0] as any);

    const fakeError = {
      response: { status: 403 },
      message: 'Forbidden',
    };

    await expect(errorInterceptor(fakeError)).rejects.toEqual(fakeError);

    expect(warnSpy).toHaveBeenCalledWith(
      'Forbidden access - insufficient permissions.'
    );
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('deve logar erro em respostas 500+ (Server error)', async () => {
    const mockUse = vi.fn();
    const mockInstance = {
      interceptors: {
        response: {
          use: mockUse,
        },
      },
    } as any;

    (mockedAxios.create as any).mockReturnValue(mockInstance);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../../services/apiClient');
    const [, errorInterceptor] = (mockUse.mock.calls[0] as any);

    const fakeError = {
      response: { status: 500 },
      message: 'Internal server error',
    };

    await expect(errorInterceptor(fakeError)).rejects.toEqual(fakeError);

    expect(errorSpy).toHaveBeenCalledWith('Server error:', fakeError.message);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
