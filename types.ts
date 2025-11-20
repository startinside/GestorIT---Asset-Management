
export enum UserRole {
  SUPER_ADMIN = 'superadmin_sistema', // Master
  ADMIN_EMPRESA = 'admin_empresa',
  GESTOR_TI = 'gestor_ti',
  TECNICO = 'tecnico',
  LEITURA = 'leitura'
}

export type CompanyStatus = 'ATIVA' | 'SUSPENSA' | 'CANCELADA' | 'INADIMPLENTE';
export type CompanyPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface CompanyLimits {
  users: number;
  branches: number;
  equipments: number;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  active: boolean;
  // Campos SaaS Master
  status: CompanyStatus;
  plan: CompanyPlan;
  contactEmail?: string;
  limits: CompanyLimits;
  renewalDate: string;
  isOverdue: boolean; // Inadimplente
}

export interface Transaction {
  id: string;
  companyId: string;
  date: string;
  type: 'MENSALIDADE' | 'RENOVACAO' | 'MULTA' | 'AJUSTE';
  amount: number;
  paymentMethod: 'BOLETO' | 'PIX' | 'CARTAO' | 'MANUAL';
  status: 'PAGO' | 'PENDENTE' | 'VENCIDO';
  description: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface EquipmentStatus {
  id: string;
  companyId: string; // Se for 'global', é do sistema master
  name: string;
  color: string; // hex or tailwind class mapping
  isSystemDefault: boolean;
}

export interface Equipment {
  id: string;
  companyId: string;
  branchId: string;
  type: string; // PC, Notebook, Monitor, etc.
  brand: string;
  model: string;
  serialNumber: string;
  internalId: string;
  patrimonyId?: string;
  statusId: string;
  description?: string;
  acquisitionDate?: string;
  imageUrl?: string;
}

export interface MaintenanceTicket {
  id: string;
  companyId: string;
  equipmentId?: string;
  title: string;
  description: string;
  kanbanStatus: 'Aberto' | 'Em Manutenção' | 'Em Análise' | 'Aguardando Peça' | 'Concluído';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  responsibleId: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
}

export interface HistoryLog {
  id: string;
  equipmentId: string;
  userId: string;
  date: string;
  type: 'CRIAÇÃO' | 'MUDANÇA_ESTADO' | 'TRANSFERENCIA' | 'MANUTENCAO';
  description: string;
}
