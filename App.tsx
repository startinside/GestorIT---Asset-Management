import React, { useState, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Wrench, 
  Users, 
  Settings, 
  LogOut, 
  Building2, 
  Bell, 
  Search, 
  Filter, 
  Plus,
  ChevronRight,
  History,
  Calendar
} from 'lucide-react';
import { 
  MOCK_COMPANIES, 
  MOCK_USERS, 
  MOCK_EQUIPMENT, 
  MOCK_STATUSES, 
  MOCK_BRANCHES,
  MOCK_TICKETS
} from './services/mockData';
import { Company, User, Equipment, EquipmentStatus, MaintenanceTicket } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- CONTEXT ---
interface AppContextType {
  currentUser: User;
  currentCompany: Company;
  setCurrentCompany: (c: Company) => void;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- COMPONENTS ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
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

const Sidebar = () => {
  const location = useLocation();
  const { currentCompany } = useAppContext();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Monitor className="h-8 w-8" />
          <span>GestorIT</span>
        </div>
        <div className="mt-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">
          {currentCompany.name}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
        <SidebarItem to="/equipamentos" icon={Monitor} label="Equipamentos" active={location.pathname.startsWith('/equipamentos')} />
        <SidebarItem to="/manutencao" icon={Wrench} label="Manutenção" active={location.pathname.startsWith('/manutencao')} />
        <SidebarItem to="/usuarios" icon={Users} label="Usuários" active={location.pathname === '/usuarios'} />
        <div className="pt-4 pb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Administração</div>
          <SidebarItem to="/configuracoes" icon={Settings} label="Configurações" active={location.pathname === '/configuracoes'} />
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { currentUser, currentCompany, setCurrentCompany } = useAppContext();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <select 
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium cursor-pointer"
            value={currentCompany.id}
            onChange={(e) => {
              const company = MOCK_COMPANIES.find(c => c.id === e.target.value);
              if(company) setCurrentCompany(company);
            }}
          >
            {MOCK_COMPANIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <Building2 size={16} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-xs text-gray-500">{currentUser.role.replace('_', ' ')}</div>
          </div>
          <img 
            src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} 
            alt="Profile" 
            className="h-9 w-9 rounded-full bg-gray-200 object-cover ring-2 ring-white shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

// --- PAGES ---

const Dashboard = () => {
  const { equipment, tickets } = useAppContext();

  const stats = [
    { label: 'Total Equipamentos', value: equipment.length, color: 'bg-blue-500' },
    { label: 'Em Manutenção', value: equipment.filter(e => e.statusId === 's2').length, color: 'bg-yellow-500' },
    { label: 'Disponíveis', value: equipment.filter(e => e.statusId === 's1').length, color: 'bg-green-500' },
    { label: 'Chamados Abertos', value: tickets.filter(t => t.kanbanStatus !== 'Concluído').length, color: 'bg-indigo-500' },
  ];

  const dataStatus = [
    { name: 'Funcionando', value: equipment.filter(e => e.statusId === 's1').length, color: '#10B981' },
    { name: 'Manutenção', value: equipment.filter(e => e.statusId === 's2').length, color: '#F59E0B' },
    { name: 'Parado', value: equipment.filter(e => e.statusId === 's3').length, color: '#6B7280' },
    { name: 'Sucata', value: equipment.filter(e => e.statusId === 's4').length, color: '#EF4444' },
  ];

  const dataTimeline = [
    { name: 'Seg', chamados: 2 },
    { name: 'Ter', chamados: 5 },
    { name: 'Qua', chamados: 3 },
    { name: 'Qui', chamados: 6 },
    { name: 'Sex', chamados: 4 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral dos ativos e manutenções</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} /> Novo Chamado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <div className={`h-2 w-2 rounded-full ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Ativos</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dataStatus} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {dataStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            {dataStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>
                <span className="text-gray-600">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chamados na Semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="chamados" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const EquipmentList = () => {
  const { equipment, currentCompany } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.type.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.internalId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? eq.statusId === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusId: string) => {
    const status = MOCK_STATUSES.find(s => s.id === statusId);
    if (!status) return null;
    // Extracting colors from class string is tricky in JS without parsing, assuming structure
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
        {status.name}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Novo Equipamento
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por serial, tipo, marca ou ID interno..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none bg-white"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">Todos os Status</option>
             {MOCK_STATUSES.filter(s => s.companyId === currentCompany.id).map(s => (
               <option key={s.id} value={s.id}>{s.name}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-3">Identificação</th>
              <th className="px-6 py-3">Tipo/Modelo</th>
              <th className="px-6 py-3">Serial</th>
              <th className="px-6 py-3">Filial</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEquipment.map((eq) => {
              const branch = MOCK_BRANCHES.find(b => b.id === eq.branchId);
              return (
                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{eq.internalId}</div>
                    <div className="text-gray-400 text-xs">{eq.patrimonyId || 'S/P'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{eq.type}</div>
                    <div className="text-gray-500 text-xs">{eq.brand} {eq.model}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 text-xs">{eq.serialNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{branch?.name}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(eq.statusId)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs inline-flex items-center gap-1">
                      Detalhes <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredEquipment.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum equipamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MaintenanceKanban = () => {
  const { tickets, setTickets, equipment } = useAppContext();
  
  const columns = [
    { id: 'Aberto', title: 'Aberto', color: 'border-t-4 border-blue-500' },
    { id: 'Em Manutenção', title: 'Em Andamento', color: 'border-t-4 border-yellow-500' },
    { id: 'Concluído', title: 'Concluído', color: 'border-t-4 border-green-500' }
  ];

  // Simple drag and drop simulation
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, newStatus: any) => {
    let id = e.dataTransfer.getData("id");
    setTickets(prev => prev.map(t => {
      if (t.id === id) return { ...t, kanbanStatus: newStatus };
      return t;
    }));
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Crítica': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quadro de Manutenção</h1>
          <p className="text-gray-500 text-sm">Gerencie chamados e ordens de serviço</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
             <Calendar size={16} /> Linha do Tempo
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
             <Plus size={16} /> Novo Chamado
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`flex-1 min-w-[300px] bg-gray-100 rounded-xl flex flex-col max-h-full ${col.color}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.id)}
          >
            <div className="p-4 font-semibold text-gray-700 flex justify-between items-center sticky top-0 bg-gray-100 rounded-t-xl z-10">
              <span>{col.title}</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tickets.filter(t => {
                    if(col.id === 'Em Manutenção') return ['Em Manutenção', 'Em Análise', 'Aguardando Peça'].includes(t.kanbanStatus);
                    return t.kanbanStatus === col.id;
                }).length}
              </span>
            </div>
            
            <div className="p-3 space-y-3 overflow-y-auto scrollbar-hide flex-1">
              {tickets.filter(t => {
                  if(col.id === 'Em Manutenção') return ['Em Manutenção', 'Em Análise', 'Aguardando Peça'].includes(t.kanbanStatus);
                  return t.kanbanStatus === col.id;
              }).map(ticket => {
                const equip = equipment.find(e => e.id === ticket.equipmentId);
                return (
                  <div 
                    key={ticket.id} 
                    draggable 
                    onDragStart={(e) => onDragStart(e, ticket.id)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{ticket.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
                    
                    {equip && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-50 pt-2">
                        <Monitor size={12} />
                        <span>{equip.type} - {equip.internalId}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP LAYOUT ---

const Layout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 pt-16 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  // Initialize State with Mock Data
  const [currentCompany, setCurrentCompany] = useState<Company>(MOCK_COMPANIES[0]);
  const [currentUser] = useState<User>(MOCK_USERS[0]);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MOCK_TICKETS);

  const contextValue = useMemo(() => ({
    currentUser,
    currentCompany,
    setCurrentCompany,
    equipment,
    setEquipment,
    tickets,
    setTickets
  }), [currentUser, currentCompany, equipment, tickets]);

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipamentos" element={<EquipmentList />} />
            <Route path="/manutencao" element={<MaintenanceKanban />} />
          </Route>
          {/* Placeholder routes for demonstration */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;