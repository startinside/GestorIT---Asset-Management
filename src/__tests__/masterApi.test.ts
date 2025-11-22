
// __tests__/masterApi.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

vi.mock('../../services/mockData', () => ({
  MOCK_COMPANIES: [
    { id: 'c1', name: 'Empresa 1', status: 'ATIVA', plan: 'STARTER' },
    { id: 'c2', name: 'Empresa 2', status: 'INADIMPLENTE', plan: 'PRO' },
  ],
  MOCK_TRANSACTIONS: [
    { id: 't1', companyId: 'c1', type: 'MENSALIDADE', status: 'PAGO', value: 100 },
    { id: 't2', companyId: 'c2', type: 'MENSALIDADE', status: 'VENCIDO', value: 200 },
  ],
  MOCK_USERS: [
    { id: 'u1', name: 'Master Admin', role: 'superadmin_sistema', email: 'admin@sys.com' },
    { id: 'u2', name: 'Gestor Cliente', role: 'gestor_ti', email: 'gestor@cliente.com' },
  ],
}));

describe('masterApi', () => {
  // Usaremos fake timers para controlar o delay()
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('getCompanies deve retornar uma CÓPIA da lista de empresas mock', async () => {
    const { masterApi } = await import('../../services/masterApi');
    const { MOCK_COMPANIES } = await import('../../services/mockData');

    const promise = masterApi.getCompanies();

    // Avança o tempo pra "pular" o delay(500)
    vi.runAllTimers();

    const companies = await promise;

    expect(companies).toEqual(MOCK_COMPANIES);
    // Garante que NÃO é a mesma referência (cópia)
    expect(companies).not.toBe(MOCK_COMPANIES);
  });

  it('getTransactions deve retornar uma CÓPIA da lista de transações mock', async () => {
    const { masterApi } = await import('../../services/masterApi');
    const { MOCK_TRANSACTIONS } = await import('../../services/mockData');

    const promise = masterApi.getTransactions();
    vi.runAllTimers();

    const transactions = await promise;

    expect(transactions).toEqual(MOCK_TRANSACTIONS);
    expect(transactions).not.toBe(MOCK_TRANSACTIONS);
  });

  it('getAdminUsers deve retornar apenas usuários com role superadmin_sistema', async () => {
    const { masterApi } = await import('../../services/masterApi');

    const promise = masterApi.getAdminUsers();
    vi.runAllTimers();

    const users = await promise;

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      role: 'superadmin_sistema',
      name: 'Master Admin',
    });
  });
});
