
import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Monitor, Wrench, Users, Settings, LogOut, Building2, Bell, Search, Filter, 
  Plus, ChevronRight, Calendar, ShieldAlert, DollarSign, Globe, Activity, Lock, Unlock, Loader2, WifiOff
} from 'lucide-react';
import { Company, User, Equipment, MaintenanceTicket, Transaction, EquipmentStatus, Branch, UserRole } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Services
import { masterApi } from './services/masterApi';
import { tenantApi } from './services/tenantApi';

// --- CONTEXT ---
interface AppContextType {
  currentUser: User | null;
  currentCompany: Company | null;
  setCurrentCompany: (c: Company) => void;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  transactions: Transaction[];
  statuses: EquipmentStatus[];
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- AUTH COMPONENTS ---

const LoginPage = () => {
  const { login, error: globalError } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mode, setMode] = useState<'tenant' | 'master'>('tenant');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      let data;
      if (mode === 'master') {
        data = await masterApi.login(email, password);
        login(data.token, data.user);
        navigate('/master');
      } else {
        data = await tenantApi.login(email, password);
        login(data.token, data.user);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setLoginError('Credenciais inválidas ou erro no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            {mode === 'master' ? <ShieldAlert size={40} className="text-indigo-600" /> : <Monitor size={40} className="text-blue-600" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GestorIT {mode === 'master' ? 'Master' : 'Login'}</h1>
          <p className="text-gray-500 text-sm">Entre com suas credenciais para continuar</p>
        </div>

        {loginError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {loginError}
          </div>
        )}
        
        {globalError && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm mb-4 text-center border border-yellow-100">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all ${
              mode === 'master' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setMode(mode === 'tenant' ? 'master' : 'tenant'); setLoginError(''); }}
            className="text-xs text-gray-500 hover:text-indigo-600 underline"
          >
            {mode === 'tenant' ? 'Acessar Painel Master' : 'Voltar para Login Tenant'}
          </button>
        </div>
        
        {/* Helper para Dev */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          <p>Dev Hint: admin@gestorit.com / admin123 (Tenant)</p>
          <p>master@gestorit.com / master123 (Master)</p>
        </div>
      </div>
    </div>
  );
};

// --- SHARED COMPONENTS ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-opacity-10 bg-white text-white font-medium shadow-sm'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const TenantSidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-50 text-indigo-600 font-medium' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

// --- TENANT COMPONENTS ---

const TenantSidebar = () => {
  const location = useLocation();
  const { currentCompany, logout } = useAppContext();

  if (!currentCompany) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Monitor className="h-8 w-8" />
          <span>GestorIT</span>
        </div>
        <div className="mt-2 text-xs text-gray-400 uppercase tracking-wider font-semibold truncate">
          {currentCompany.name}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <TenantSidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
        <TenantSidebarItem to="/equipamentos" icon={Monitor} label="Equipamentos" active={location.pathname.startsWith('/equipamentos')} />
        <TenantSidebarItem to="/manutencao" icon={Wrench} label="Manutenção" active={location.pathname.startsWith('/manutencao')} />
        <TenantSidebarItem to="/usuarios" icon={Users} label="Usuários" active={location.pathname === '/usuarios'} />
        <div className="pt-4 pb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Administração</div>
          <TenantSidebarItem to="/configuracoes" icon={Settings} label="Configurações" active={location.pathname === '/configuracoes'} />
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

const TenantHeader = () => {
  const { currentUser, currentCompany, setCurrentCompany, companies } = useAppContext();

  if (!currentCompany || !currentUser) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <select 
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium cursor-pointer"
            value={currentCompany.id}
            onChange={(e) => {
              const company = companies.find(c => c.id === e.target.value);
              if(company) setCurrentCompany(company);
            }}
          >
            {companies.filter(c => c.active).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <Building2 size={16} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-xs text-gray-500">{currentUser.role}</div>
          </div>
          <img 
            src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} 
            alt="Profile" 
            className="h-9 w-9 rounded-full bg-gray-200 object-cover ring-2 ring-white shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const { equipment, tickets, currentCompany } = useAppContext();
  if (!currentCompany) return null;

  const stats = [
    { label: 'Total Equipamentos', value: equipment.length, color: 'bg-blue-500' },
    { label: 'Em Manutenção', value: equipment.filter(e => e.statusId === 's2').length, color: 'bg-yellow-500' },
    { label: 'Chamados Abertos', value: tickets.filter(t => t.kanbanStatus !== 'Concluído').length, color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard - {currentCompany.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 uppercase">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <div className={`h-2 w-2 rounded-full ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EquipmentList = () => {
  const { equipment, statuses, branches } = useAppContext();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Novo Equipamento</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome/ID</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Filial</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {equipment.map((eq) => {
              const branch = branches.find(b => b.id === eq.branchId);
              const status = statuses.find(s => s.id === eq.statusId);
              return (
                <tr key={eq.id}>
                  <td className="px-6 py-4 font-medium">{eq.internalId}</td>
                  <td className="px-6 py-4">{eq.type}</td>
                  <td className="px-6 py-4">{branch?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100'}`}>
                      {status?.name || 'Unknown'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MaintenanceKanban = () => {
  const { tickets } = useAppContext();
  const columns = ['Aberto', 'Em Manutenção', 'Concluído'];

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kanban Manutenção</h1>
      <div className="flex-1 flex gap-6 overflow-x-auto">
        {columns.map(col => (
          <div key={col} className="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-700 mb-4">{col}</h3>
            <div className="space-y-3">
              {tickets.filter(t => t.kanbanStatus === col).map(t => (
                <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-sm">{t.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MASTER COMPONENTS ---

const MasterSidebar = () => {
  const location = useLocation();
  const { logout } = useAppContext();

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-10 text-white">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
          <ShieldAlert className="h-8 w-8" />
          <span>MasterAdmin</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <SidebarItem to="/master" icon={Activity} label="Dashboard" active={location.pathname === '/master'} />
        <SidebarItem to="/master/empresas" icon={Building2} label="Empresas" active={location.pathname.startsWith('/master/empresas')} />
        <SidebarItem to="/master/financeiro" icon={DollarSign} label="Financeiro" active={location.pathname.startsWith('/master/financeiro')} />
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-800 rounded hover:bg-gray-700 w-full justify-center">
           <LogOut size={12} /> Sair
        </button>
      </div>
    </div>
  );
};

const MasterDashboard = () => {
  const { companies, transactions } = useAppContext();
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Master</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Empresas</p>
          <p className="text-3xl font-bold">{companies.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <p className="text-sm text-gray-500">Transações</p>
           <p className="text-3xl font-bold">{transactions.length}</p>
        </div>
      </div>
    </div>
  );
};

const MasterCompanyList = () => {
  const { companies } = useAppContext();
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">CNPJ</th>
              <th className="px-6 py-3">Plano</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">{c.cnpj}</td>
                <td className="px-6 py-4">{c.plan}</td>
                <td className="px-6 py-4">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- LAYOUTS ---

const TenantLayout = () => {
  const { isLoading, error, currentUser } = useAppContext();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === UserRole.SUPER_ADMIN) return <Navigate to="/master" replace />;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <TenantSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TenantHeader />
        <main className="flex-1 pt-16"><Outlet /></main>
      </div>
    </div>
  );
};

const MasterLayout = () => {
  const { isLoading, error, currentUser } = useAppContext();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== UserRole.SUPER_ADMIN) return <Navigate to="/" replace />;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <MasterSidebar />
      <div className="flex-1 flex flex-col ml-64"><Outlet /></div>
    </div>
  );
};

// --- APP ---

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statuses, setStatuses] = useState<EquipmentStatus[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Initial loading handled by login check
  const [error, setError] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem('gestorit_token');
    const userStr = localStorage.getItem('gestorit_user');
    if (token && userStr) {
      setCurrentUser(JSON.parse(userStr));
      // Trigger data load based on role
    }
  }, []);

  // Load Data Effect
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentUser.role === UserRole.SUPER_ADMIN) {
          const [comps, trans] = await Promise.all([
            masterApi.getCompanies(),
            masterApi.getTransactions()
          ]);
          setCompanies(comps);
          setTransactions(trans);
        } else {
          // Tenant Logic: Find associated companies
          // For simplicity in this stage, fetch all companies the user has access to
          // Ideally this comes from the /me endpoint or login response. 
          // Here we simulate by fetching available companies from master (if allowed) or assuming user has companies attached.
          // Since the prompt asks for real connection, let's assume login returns user.companies.
          // We will fetch the first company's data.
          
          // NOTE: In a real scenario, we might hit an endpoint /v1/minhas-empresas
          // For this stage, we'll try to get data for the ID stored in currentUser.companies[0] if exists
          
          if (currentUser.companies && currentUser.companies.length > 0) {
             const companyId = currentUser.companies[0];
             // Fetch basic company info (mocked endpoint call concept for now, or assume we have it)
             // Let's just fetch equipments to verify connection
             const [eq, tk, st, br] = await Promise.all([
               tenantApi.getEquipments(companyId),
               tenantApi.getMaintenanceTickets(companyId),
               tenantApi.getEquipmentStatuses(companyId),
               tenantApi.getBranches(companyId)
             ]);
             setEquipment(eq);
             setTickets(tk);
             setStatuses(st);
             setBranches(br);
             
             // Create a fake company object just for context if we don't have the endpoint yet
             setCurrentCompany({ id: companyId, name: 'Minha Empresa', active: true, status: 'ATIVA', plan: 'PRO', limits: {users:10, branches:2, equipments:100}, renewalDate: '', isOverdue: false, cnpj: '' });
          }
        }
      } catch (err: any) {
        console.error("Data load error", err);
        if (err.response?.status !== 401) {
          setError("Falha ao carregar dados do servidor.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const login = (token: string, user: User) => {
    localStorage.setItem('gestorit_token', token);
    localStorage.setItem('gestorit_user', JSON.stringify(user));
    setCurrentUser(user);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('gestorit_token');
    localStorage.removeItem('gestorit_user');
    setCurrentUser(null);
    setCurrentCompany(null);
    setCompanies([]);
    setEquipment([]);
  };

  const contextValue = useMemo(() => ({
    currentUser, currentCompany, setCurrentCompany, equipment, setEquipment, tickets, setTickets,
    companies, setCompanies, transactions, statuses, branches, isLoading, error, login, logout
  }), [currentUser, currentCompany, equipment, tickets, companies, transactions, statuses, branches, isLoading, error]);

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Tenant Routes */}
          <Route path="/" element={<TenantLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="equipamentos" element={<EquipmentList />} />
            <Route path="manutencao" element={<MaintenanceKanban />} />
            <Route path="usuarios" element={<div>Gestão Usuários</div>} />
            <Route path="configuracoes" element={<div>Configurações</div>} />
          </Route>

          {/* Master Routes */}
          <Route path="/master" element={<MasterLayout />}>
             <Route index element={<MasterDashboard />} />
             <Route path="empresas" element={<MasterCompanyList />} />
             <Route path="financeiro" element={<div>Financeiro</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
