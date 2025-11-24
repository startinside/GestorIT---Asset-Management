import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Wrench,
  Users,
  Settings,
  LogOut,
  Building2,
  DollarSign,
  Bell,
  ShieldAlert,
} from 'lucide-react';
import {
  Company,
  User,
  Equipment,
  MaintenanceTicket,
  Transaction,
  EquipmentStatus,
  Branch,
  UserRole,
} from './types';
import { masterApi } from './services/masterApi';
import { tenantApi } from './services/tenantApi';

// --------------------
// Contexto da Aplicação
// --------------------

type AuthMode = 'tenant' | 'master';

interface AppContextType {
  mode: AuthMode | null;
  currentUser: User | null;
  currentCompanyId: string | null;

  equipment: Equipment[];
  tickets: MaintenanceTicket[];
  companies: Company[];
  transactions: Transaction[];
  statuses: EquipmentStatus[];
  branches: Branch[];

  isLoading: boolean;
  error: string | null;

  login: (mode: AuthMode, email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentCompanyId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return ctx;
};

// --------------------
// Provider
// --------------------

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statuses, setStatuses] = useState<EquipmentStatus[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restaura sessão do localStorage (token + modo + usuário mínimo)
  useEffect(() => {
    const storedToken = localStorage.getItem('gestorit_token');
    const storedMode = localStorage.getItem('gestorit_mode') as AuthMode | null;
    const storedUser = localStorage.getItem('gestorit_user');
    const storedCompanyId = localStorage.getItem('gestorit_company_id');

    if (storedToken && storedMode && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setMode(storedMode);
        setCurrentUser(parsedUser);
        if (storedCompanyId) setCurrentCompanyId(storedCompanyId);
      } catch {
        // Se der erro, limpa a sessão
        localStorage.removeItem('gestorit_token');
        localStorage.removeItem('gestorit_mode');
        localStorage.removeItem('gestorit_user');
        localStorage.removeItem('gestorit_company_id');
      }
    }
  }, []);

  // Carrega dados iniciais conforme o modo/empresa
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!mode || !currentUser) return;
      setIsLoading(true);
      setError(null);
      try {
        if (mode === 'master') {
          const [companiesRes, transactionsRes] = await Promise.all([
            masterApi.getCompanies(),
            masterApi.getTransactions(),
          ]);
          setCompanies(companiesRes);
          setTransactions(transactionsRes);
        } else if (mode === 'tenant') {
          const companyId =
            currentCompanyId ||
            currentUser.companies?.[0] ||
            'c1'; // fallback simples

          setCurrentCompanyId(companyId);
          localStorage.setItem('gestorit_company_id', companyId);

          const [equipRes, ticketsRes, statusesRes, branchesRes] =
            await Promise.all([
              tenantApi.getEquipments(companyId),
              tenantApi.getMaintenanceTickets(companyId),
              tenantApi.getEquipmentStatuses(companyId),
              tenantApi.getBranches(companyId),
            ]);
          setEquipment(equipRes);
          setTickets(ticketsRes);
          setStatuses(statusesRes);
          setBranches(branchesRes);
        }
      } catch (err: any) {
        console.error(err);
        setError('Erro ao carregar dados iniciais.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [mode, currentUser, currentCompanyId]);

  const login = async (modeSel: AuthMode, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let token: string;
      let user: User;

      if (modeSel === 'master') {
        const res = await masterApi.login(email, password);
        token = res.token;
        user = res.user;
      } else {
        const res = await tenantApi.login(email, password);
        token = res.token;
        user = res.user;
      }

      localStorage.setItem('gestorit_token', token);
      localStorage.setItem('gestorit_mode', modeSel);
      localStorage.setItem('gestorit_user', JSON.stringify(user));

      setMode(modeSel);
      setCurrentUser(user);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gestorit_token');
    localStorage.removeItem('gestorit_mode');
    localStorage.removeItem('gestorit_user');
    localStorage.removeItem('gestorit_company_id');
    setMode(null);
    setCurrentUser(null);
    setCurrentCompanyId(null);
    setEquipment([]);
    setTickets([]);
    setCompanies([]);
    setTransactions([]);
    setStatuses([]);
    setBranches([]);
  };

  const value: AppContextType = useMemo(
    () => ({
      mode,
      currentUser,
      currentCompanyId,
      equipment,
      tickets,
      companies,
      transactions,
      statuses,
      branches,
      isLoading,
      error,
      login,
      logout,
      setCurrentCompanyId,
    }),
    [
      mode,
      currentUser,
      currentCompanyId,
      equipment,
      tickets,
      companies,
      transactions,
      statuses,
      branches,
      isLoading,
      error,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --------------------
// Componentes de Layout / UI
// --------------------

const TopBar = () => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const title = useMemo(() => {
    if (location.pathname.startsWith('/master')) return 'Painel Master (SaaS)';
    if (location.pathname.startsWith('/app')) return 'Gestão de Ativos';
    return 'GestorIT';
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">
          Controle centralizado de equipamentos, manutenções e empresas.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                {currentUser.name}
              </div>
              <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-100 px-2 py-1 rounded-full bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const TenantSidebar = () => {
  const location = useLocation();
  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/equipamentos', label: 'Equipamentos', icon: Monitor },
    { to: '/app/manutencao', label: 'Manutenção', icon: Wrench },
    { to: '/app/usuarios', label: 'Usuários', icon: Users },
    { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-indigo-600" />
        <div>
          <div className="text-sm font-semibold text-gray-900">GestorIT</div>
          <div className="text-xs text-gray-500">Área do Cliente</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                active
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const MasterSidebar = () => {
  const location = useLocation();
  const navItems = [
    { to: '/master', label: 'Visão Geral', icon: LayoutDashboard },
    { to: '/master/empresas', label: 'Empresas', icon: Building2 },
    { to: '/master/financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-emerald-400" />
        <div>
          <div className="text-sm font-semibold">GestorIT Master</div>
          <div className="text-xs text-slate-400">Painel SaaS</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                active
                  ? 'bg-slate-800 text-emerald-300 font-medium'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

// --------------------
// Páginas Tenant
// --------------------

const TenantDashboard = () => {
  const { equipment, tickets, statuses, branches } = useAppContext();

  const totalEquipments = equipment.length;
  const openTickets = tickets.length;

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const st of statuses) {
      counts[st.name] = 0;
    }
    for (const eq of equipment) {
      const st = statuses.find((s) => s.id === eq.statusId);
      if (st) {
        counts[st.name] = (counts[st.name] || 0) + 1;
      }
    }
    return counts;
  }, [equipment, statuses]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Equipamentos</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">
              {totalEquipments}
            </div>
            <Monitor className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Chamados em aberto</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">
              {openTickets}
            </div>
            <Wrench className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Estados de Equipamento</div>
          <ul className="mt-2 text-xs text-gray-700 space-y-1">
            {Object.entries(statusSummary).map(([name, count]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Últimos equipamentos cadastrados
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-2">Descrição</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Filial</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {equipment.slice(0, 5).map((eq) => {
                const st = statuses.find((s) => s.id === eq.statusId);
                const br = branches.find((b) => b.id === eq.branchId);
                return (
                  <tr key={eq.id} className="border-b last:border-0">
                    <td className="py-2">{eq.description || eq.model}</td>
                    <td className="py-2">{eq.type}</td>
                    <td className="py-2">{br?.name || '-'}</td>
                    <td className="py-2">{st?.name || '-'}</td>
                  </tr>
                );
              })}
              {equipment.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-xs text-gray-500"
                  >
                    Nenhum equipamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EquipmentList = () => {
  const { equipment, statuses, branches } = useAppContext();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Equipamentos cadastrados
        </h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-2">Interno</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Modelo</th>
                <th className="py-2">Filial</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => {
                const st = statuses.find((s) => s.id === eq.statusId);
                const br = branches.find((b) => b.id === eq.branchId);
                return (
                  <tr key={eq.id} className="border-b last:border-0">
                    <td className="py-2">{eq.internalId || '-'}</td>
                    <td className="py-2">{eq.type}</td>
                    <td className="py-2">{eq.model}</td>
                    <td className="py-2">{br?.name || '-'}</td>
                    <td className="py-2">{st?.name || '-'}</td>
                  </tr>
                );
              })}
              {equipment.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-xs text-gray-500"
                  >
                    Nenhum equipamento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MaintenanceKanban = () => {
  const { tickets } = useAppContext();

  const grouped = useMemo(() => {
    const groups: Record<string, MaintenanceTicket[]> = {};
    for (const t of tickets) {
      const col = t.kanbanStatus || 'Aberto';
      if (!groups[col]) groups[col] = [];
      groups[col].push(t);
    }
    return groups;
  }, [tickets]);

  const columns = ['Aberto', 'Em Andamento', 'Concluído'];

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Chamados de manutenção
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div
            key={col}
            className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">{col}</span>
              <span className="text-xs text-gray-500">
                {grouped[col]?.length || 0}
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {grouped[col]?.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-md border border-gray-200 p-2 text-xs"
                >
                  <div className="font-semibold text-gray-800">
                    {t.title || 'Chamado'}
                  </div>
                  <div className="text-gray-600 mt-1 line-clamp-2">
                    {t.description}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400">
                    Vencimento: {t.dueDate || '-'}
                  </div>
                </div>
              )) || (
                <div className="text-[11px] text-gray-400">
                  Nenhum chamado nesta coluna.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --------------------
// Páginas Master
// --------------------

const MasterDashboard = () => {
  const { companies, transactions } = useAppContext();

  const totalEmpresas = companies.length;
  const inadimplentes = companies.filter((c) => c.isOverdue).length;
  const faturamento =
    transactions.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-300">Empresas Ativas</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-semibold">{totalEmpresas}</div>
            <Building2 className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div className="bg-slate-900 text-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-300">Inadimplentes</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-semibold">{inadimplentes}</div>
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="bg-slate-900 text-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-300">Faturamento Total</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-semibold">
              R$ {faturamento.toFixed(2)}
            </div>
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MasterCompanyList = () => {
  const { companies } = useAppContext();

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        Empresas Clientes
      </h2>
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-100">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-700">
                <th className="py-2 text-left">Empresa</th>
                <th className="py-2 text-left">CNPJ</th>
                <th className="py-2 text-left">Plano</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-slate-800 last:border-0">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-xs text-slate-300">{c.cnpj}</td>
                  <td className="py-2 text-xs">{c.plan}</td>
                  <td className="py-2 text-xs">
                    {c.status} {c.isOverdue ? '(Inadimplente)' : ''}
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-xs text-slate-400"
                  >
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------
// Layouts protegidos
// --------------------

const TenantLayout = () => {
  const { isLoading, error } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <TenantSidebar />
        <main className="flex-1 bg-gray-50">
          {isLoading && (
            <div className="p-4 text-xs text-gray-500">Carregando...</div>
          )}
          {error && (
            <div className="p-4 text-xs text-red-600 bg-red-50 border-b border-red-100">
              {error}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const MasterLayout = () => {
  const { isLoading, error } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <TopBar />
      <div className="flex flex-1">
        <MasterSidebar />
        <main className="flex-1 bg-slate-950">
          {isLoading && (
            <div className="p-4 text-xs text-slate-400">Carregando...</div>
          )}
          {error && (
            <div className="p-4 text-xs text-red-400 bg-red-950 border-b border-red-800">
              {error}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --------------------
// Login
// --------------------

const LoginPage = () => {
  const { login, error } = useAppContext();
  const [mode, setMode] = useState<AuthMode>('tenant');
  const [email, setEmail] = useState('admin@gestorit.com');
  const [password, setPassword] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await login(mode, email, password);
      if (mode === 'master') {
        navigate('/master');
      } else {
        navigate('/app');
      }
    } catch {
      setLocalError('Credenciais inválidas ou erro no servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">GestorIT</h1>
            <p className="text-xs text-gray-500">
              Controle centralizado de equipamentos e empresas.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setMode('tenant')}
            className={`flex-1 border rounded-full py-1 ${
              mode === 'tenant'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            Área do Cliente
          </button>
          <button
            type="button"
            onClick={() => setMode('master')}
            className={`flex-1 border rounded-full py-1 ${
              mode === 'master'
                ? 'bg-slate-900 text-emerald-300 border-slate-900'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            Painel Master
          </button>
        </div>

        {(error || localError) && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-md px-3 py-2 text-xs mb-3">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === 'master'
                  ? 'master@gestorit.com'
                  : 'admin@gestorit.com'
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --------------------
// Proteção de rotas
// --------------------

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAppContext();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// --------------------
// App (Router)
// --------------------

const App = () => {
  return (
    <React.StrictMode>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/app/*"
              element={
                <RequireAuth>
                  <TenantLayout />
                </RequireAuth>
              }
            >
              <Route index element={<TenantDashboard />} />
              <Route path="equipamentos" element={<EquipmentList />} />
              <Route path="manutencao" element={<MaintenanceKanban />} />
              <Route
                path="usuarios"
                element={
                  <div className="p-6 text-sm text-gray-600">
                    Gestão de usuários (em desenvolvimento).
                  </div>
                }
              />
              <Route
                path="configuracoes"
                element={
                  <div className="p-6 text-sm text-gray-600">
                    Configurações da empresa (em desenvolvimento).
                  </div>
                }
              />
            </Route>

            <Route
              path="/master/*"
              element={
                <RequireAuth>
                  <MasterLayout />
                </RequireAuth>
              }
            >
              <Route index element={<MasterDashboard />} />
              <Route path="empresas" element={<MasterCompanyList />} />
              <Route
                path="financeiro"
                element={
                  <div className="p-6 text-sm text-slate-100">
                    Relatórios financeiros (em desenvolvimento).
                  </div>
                }
              />
            </Route>

            {/* Redirecionar raiz para login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </React.StrictMode>
  );
};

export default App;
