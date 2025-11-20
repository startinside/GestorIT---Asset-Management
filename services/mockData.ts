import { Company, Branch, User, UserRole, Equipment, EquipmentStatus, MaintenanceTicket, HistoryLog, Transaction } from '../types';

export const MOCK_COMPANIES: Company[] = [
  { 
    id: 'c1', 
    name: 'TechSolutions Corp', 
    cnpj: '12.345.678/0001-90', 
    active: true,
    status: 'ATIVA',
    plan: 'ENTERPRISE',
    contactEmail: 'financeiro@techsolutions.com',
    limits: { users: 50, branches: 10, equipments: 1000 },
    renewalDate: '2023-12-01',
    isOverdue: false
  },
  { 
    id: 'c2', 
    name: 'Demo Retail Ltda', 
    cnpj: '98.765.432/0001-10', 
    active: true,
    status: 'INADIMPLENTE',
    plan: 'PRO',
    contactEmail: 'contato@demoretail.com',
    limits: { users: 10, branches: 3, equipments: 200 },
    renewalDate: '2023-10-15',
    isOverdue: true
  },
  { 
    id: 'c3', 
    name: 'Startup Inovadora', 
    cnpj: '11.222.333/0001-00', 
    active: false,
    status: 'SUSPENSA',
    plan: 'STARTER',
    contactEmail: 'admin@startup.com',
    limits: { users: 3, branches: 1, equipments: 50 },
    renewalDate: '2023-09-01',
    isOverdue: true
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', companyId: 'c1', date: '2023-10-01', type: 'MENSALIDADE', amount: 1500.00, paymentMethod: 'BOLETO', status: 'PAGO', description: 'Mensalidade Outubro/23' },
  { id: 'tr2', companyId: 'c1', date: '2023-09-01', type: 'MENSALIDADE', amount: 1500.00, paymentMethod: 'BOLETO', status: 'PAGO', description: 'Mensalidade Setembro/23' },
  { id: 'tr3', companyId: 'c2', date: '2023-10-15', type: 'MENSALIDADE', amount: 500.00, paymentMethod: 'PIX', status: 'VENCIDO', description: 'Mensalidade Outubro/23' },
  { id: 'tr4', companyId: 'c3', date: '2023-08-01', type: 'MENSALIDADE', amount: 150.00, paymentMethod: 'CARTAO', status: 'VENCIDO', description: 'Mensalidade Agosto/23' },
];

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', companyId: 'c1', name: 'Matriz - São Paulo', code: 'SP-HQ' },
  { id: 'b2', companyId: 'c1', name: 'Filial - Rio de Janeiro', code: 'RJ-01' },
  { id: 'b3', companyId: 'c2', name: 'Loja Centro', code: 'LJ-001' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin Demo', email: 'admin@example.com', role: UserRole.ADMIN_EMPRESA, avatarUrl: 'https://picsum.photos/200' },
  { id: 'u2', name: 'João Técnico', email: 'joao@tech.com', role: UserRole.TECNICO },
  { id: 'u99', name: 'Master SuperAdmin', email: 'master@sistema.com', role: UserRole.SUPER_ADMIN, avatarUrl: 'https://ui-avatars.com/api/?name=Master+Admin&background=000&color=fff' },
];

export const MOCK_STATUSES: EquipmentStatus[] = [
  { id: 's1', companyId: 'c1', name: 'Funcionando', color: 'bg-green-100 text-green-800', isSystemDefault: true },
  { id: 's2', companyId: 'c1', name: 'Em Manutenção', color: 'bg-yellow-100 text-yellow-800', isSystemDefault: true },
  { id: 's3', companyId: 'c1', name: 'Parado/Estoque', color: 'bg-gray-100 text-gray-800', isSystemDefault: true },
  { id: 's4', companyId: 'c1', name: 'Sucata', color: 'bg-red-100 text-red-800', isSystemDefault: true },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { 
    id: 'eq1', companyId: 'c1', branchId: 'b1', type: 'Notebook', brand: 'Dell', model: 'Latitude 5420', 
    serialNumber: 'DLL-12345', internalId: 'NB-001', patrimonyId: 'PAT-1001', statusId: 's1', 
    description: 'Notebook do Financeiro', acquisitionDate: '2023-01-15', imageUrl: 'https://picsum.photos/300/200'
  },
  { 
    id: 'eq2', companyId: 'c1', branchId: 'b2', type: 'Desktop', brand: 'Lenovo', model: 'ThinkCentre', 
    serialNumber: 'LNV-99887', internalId: 'DT-045', patrimonyId: 'PAT-1045', statusId: 's2', 
    description: 'PC da Recepção', acquisitionDate: '2022-05-20'
  },
  { 
    id: 'eq3', companyId: 'c1', branchId: 'b1', type: 'Monitor', brand: 'Samsung', model: '24 inch', 
    serialNumber: 'SAM-55555', internalId: 'MN-200', statusId: 's1', 
    description: 'Monitor extra TI', acquisitionDate: '2023-08-10'
  },
   { 
    id: 'eq4', companyId: 'c1', branchId: 'b1', type: 'Impressora', brand: 'HP', model: 'LaserJet Pro', 
    serialNumber: 'HP-PRT-001', internalId: 'PRT-01', statusId: 's4', 
    description: 'Queimou a placa lógica', acquisitionDate: '2020-02-10'
  }
];

export const MOCK_TICKETS: MaintenanceTicket[] = [
  {
    id: 't1', companyId: 'c1', equipmentId: 'eq2', title: 'PC não liga', description: 'O computador da recepção não está dando vídeo.',
    kanbanStatus: 'Em Manutenção', priority: 'Alta', responsibleId: 'u2', createdAt: '2023-10-25T09:00:00', dueDate: '2023-10-27T18:00:00'
  },
  {
    id: 't2', companyId: 'c1', equipmentId: 'eq4', title: 'Avaliar descarte', description: 'Impressora antiga precisa de laudo para descarte.',
    kanbanStatus: 'Aberto', priority: 'Baixa', responsibleId: 'u2', createdAt: '2023-10-26T14:00:00', dueDate: '2023-11-01T18:00:00'
  },
   {
    id: 't3', companyId: 'c1', equipmentId: 'eq1', title: 'Upgrade de RAM', description: 'Solicitado upgrade para 32GB.',
    kanbanStatus: 'Concluído', priority: 'Média', responsibleId: 'u2', createdAt: '2023-10-20T10:00:00', dueDate: '2023-10-22T18:00:00', completedAt: '2023-10-21T16:00:00'
  }
];

export const MOCK_HISTORY: HistoryLog[] = [
  { id: 'h1', equipmentId: 'eq2', userId: 'u1', date: '2023-10-25T09:05:00', type: 'MUDANÇA_ESTADO', description: 'Alterado de Funcionando para Em Manutenção' },
  { id: 'h2', equipmentId: 'eq1', userId: 'u1', date: '2023-01-15T08:00:00', type: 'CRIAÇÃO', description: 'Equipamento cadastrado no sistema' }
];