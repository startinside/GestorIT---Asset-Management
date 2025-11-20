export enum UserRole {
  SUPER_ADMIN = 'superadmin_sistema',
  ADMIN_EMPRESA = 'admin_empresa',
  GESTOR_TI = 'gestor_ti',
  TECNICO = 'tecnico',
  LEITURA = 'leitura'
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  active: boolean;
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
  companyId: string;
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
  kanbanStatus: 'Aberto' | 'Em Análise' | 'Em Manutenção' | 'Aguardando Peça' | 'Concluído';
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
