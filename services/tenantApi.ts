import apiClient from './apiClient';
import {
	Equipment,
	MaintenanceTicket,
	User,
	EquipmentStatus,
	Branch,
	ApiResponse,
	AuthResponse,
} from '../types';

export interface KanbanColumn {
	id: string;
	companyId: string;
	name: string;
	order: number;
	type: string;
	isSchedulingColumn: boolean;
	scheduleEnabled: boolean;
	slaHours?: number | null;
	color?: string | null;
}

export interface TicketEvent {
	id: string;
	companyId: string;
	ticketId: string;
	type: 'created' | 'status_changed' | string;
	fromStatus?: string | null;
	toStatus?: string | null;
	note?: string | null;
	createdAt: string;
}

export const tenantApi = {
	// ----------------------------------------------------
	// Autenticação (Tenant)
	// ----------------------------------------------------
	login: async (email: string, password: string): Promise<AuthResponse> => {
		const response = await apiClient.post<ApiResponse<AuthResponse>>(
			'/v1/auth/login',
			{ email, password }
		);
		return response.data.data;
	},

	// ----------------------------------------------------
	// Metadados: Filiais, Estados de equipamento
	// ----------------------------------------------------
	getBranches: async (companyId: string): Promise<Branch[]> => {
		const response = await apiClient.get<ApiResponse<Branch[]>>(
			'/v1/filiais',
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	getEquipmentStatuses: async (
		companyId: string
	): Promise<EquipmentStatus[]> => {
		const response = await apiClient.get<ApiResponse<EquipmentStatus[]>>(
			'/v1/estados_equipamento',
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// ----------------------------------------------------
	// Usuários do Tenant (empresa)
	// ----------------------------------------------------
	// Listar usuários da empresa (tenant)
	getUsers: async (companyId: string): Promise<User[]> => {
		const response = await apiClient.get<ApiResponse<User[]>>(
			'/v1/usuarios',
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data ?? [];
	},

	// Criar usuário
	createUser: async (
		companyId: string,
		payload: Partial<User>
	): Promise<User> => {
		const response = await apiClient.post<ApiResponse<User>>(
			'/v1/usuarios',
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Atualizar usuário
	updateUser: async (
		companyId: string,
		userId: string,
		payload: Partial<User>
	): Promise<User> => {
		const response = await apiClient.patch<ApiResponse<User>>(
			`/v1/usuarios/${userId}`,
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Suspender/Reativar usuário
	suspendUser: async (
		companyId: string,
		userId: string,
		active: boolean
	): Promise<User> => {
		const response = await apiClient.post<ApiResponse<User>>(
			`/v1/usuarios/${userId}/suspender`,
			{ active },
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Excluir usuário
	deleteUser: async (
		companyId: string,
		userId: string
	): Promise<void> => {
		await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
			`/v1/usuarios/${userId}`,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
	},

	// Avatar
	uploadAvatar: async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await apiClient.post<
			ApiResponse<{ url: string }>
		>('/v1/upload/avatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data.data.url;
	},


	// ----------------------------------------------------
	// Equipamentos
	// ----------------------------------------------------
	// Listar equipamentos da empresa
	getEquipments: async (companyId: string): Promise<Equipment[]> => {
		const response = await apiClient.get<ApiResponse<Equipment[]>>(
			'/v1/equipamentos',
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Criar novo equipamento
	createEquipment: async (
		companyId: string,
		payload: Partial<Equipment>
	): Promise<Equipment> => {
		const response = await apiClient.post<ApiResponse<Equipment>>(
			'/v1/equipamentos',
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Atualizar equipamento
	updateEquipment: async (
		companyId: string,
		equipmentId: string,
		payload: Partial<Equipment>
	): Promise<Equipment> => {
		const response = await apiClient.patch<ApiResponse<Equipment>>(
			`/v1/equipamentos/${equipmentId}`,
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Suspender/Reativar equipamento
	suspendEquipment: async (
		companyId: string,
		equipmentId: string,
		active: boolean
	): Promise<Equipment> => {
		const response = await apiClient.post<ApiResponse<Equipment>>(
			`/v1/equipamentos/${equipmentId}/suspender`,
			{ active },
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Upload de imagem genérica (usado para múltiplas fotos de equipamentos, por exemplo)
	uploadGenericImage: async (
		companyId: string,
		file: File
	): Promise<string> => {
		const formData = new FormData();
		formData.append('file', file);

		// Endpoint: /v1/upload/image (simétrico ao /v1/upload/avatar)
		const response = await apiClient.post<
			ApiResponse<{ imageUrl: string }>
		>('/v1/upload/image', formData, {
			headers: {
				'X-Company-Id': companyId,
				'Content-Type': 'multipart/form-data', // Sobrescrever para envio de arquivo
			},
		});
		// Assume que a resposta retorna um objeto { imageUrl: 'url_da_imagem' }
		return response.data.data.imageUrl;
	},

	// Upload de imagens de equipamentos
	uploadEquipmentPhotos: async (
		companyId: string,
		equipmentId: string,
		files: File[]
	): Promise<string[]> => {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});

		const response = await apiClient.post<
			ApiResponse<{ photos: string[] }>
		>(`/v1/equipamentos/${equipmentId}/fotos`, formData, {
			headers: {
				'X-Company-Id': companyId,
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data.data?.photos ?? [];
	},

	// Excluir equipamento
	deleteEquipment: async (
		companyId: string,
		equipmentId: string
	): Promise<void> => {
		await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
			`/v1/equipamentos/${equipmentId}`,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
	},

	duplicateEquipment: async (companyId: string, equipmentId: string) => {
		const response = await apiClient.post<ApiResponse<Equipment>>(
			`/v1/equipamentos/${equipmentId}/duplicar`,
			{},
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data;
	},

	// ----------------------------------------------------
	// Chamados de manutenção / Kanban
	// ----------------------------------------------------

	// Criar novo chamado
	createTicket: async (
		companyId: string,
		payload: Partial<MaintenanceTicket>
	): Promise<MaintenanceTicket> => {
		const response = await apiClient.post<ApiResponse<MaintenanceTicket>>(
			'/v1/chamados',
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Atualizar coluna Kanban do chamado
	moveTicket: async (
		companyId: string,
		ticketId: string,
		newStatus: MaintenanceTicket['kanbanStatus']
	): Promise<MaintenanceTicket> => {
		const response = await apiClient.patch<ApiResponse<MaintenanceTicket>>(
			`/v1/chamados/${ticketId}/kanban`,
			{ kanbanStatus: newStatus },
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Atualziar Chamados
	updateTicket: async (
		companyId: string,
		ticketId: string,
		payload: Partial<MaintenanceTicket>
	): Promise<MaintenanceTicket> => {
		const response = await apiClient.patch<ApiResponse<MaintenanceTicket>>(
			`/v1/chamados/${ticketId}`,
			payload,
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Listar chamados
	getMaintenanceTickets: async (
		companyId: string
	): Promise<MaintenanceTicket[]> => {
		const response = await apiClient.get<ApiResponse<MaintenanceTicket[]>>(
			'/v1/chamados',
			{
				headers: { 'X-Company-Id': companyId },
			}
		);
		return response.data.data;
	},

	// Timeline de Chamados
	getTicketTimeline: async (companyId: string, ticketId: string) => {
		const response = await apiClient.get<ApiResponse<TicketEvent[]>>(
			`/v1/chamados/${ticketId}/timeline`,
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data || [];
	},

	// -------------------------
	// Kanban Columns (config)
	// -------------------------

	getKanbanColumns: async (companyId: string) => {
		const response = await apiClient.get<ApiResponse<KanbanColumn[]>>(
			'/v1/kanban/colunas',
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data || [];
	},

	createKanbanColumn: async (
		companyId: string,
		payload: Partial<KanbanColumn>
	) => {
		const response = await apiClient.post<ApiResponse<KanbanColumn>>(
			'/v1/kanban/colunas',
			payload,
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data;
	},

	updateKanbanColumn: async (
		companyId: string,
		columnId: string,
		payload: Partial<KanbanColumn>
	) => {
		const response = await apiClient.patch<ApiResponse<KanbanColumn>>(
			`/v1/kanban/colunas/${columnId}`,
			payload,
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data;
	},

	deleteKanbanColumn: async (companyId: string, columnId: string) => {
		const response = await apiClient.delete<ApiResponse<KanbanColumn>>(
			`/v1/kanban/colunas/${columnId}`,
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data;
	},

	reorderKanbanColumns: async (companyId: string, orderedIds: string[]) => {
		const response = await apiClient.patch<ApiResponse<KanbanColumn[]>>(
			'/v1/kanban/colunas/reorder',
			{ orderedIds },
			{ headers: { 'X-Company-Id': companyId } }
		);
		return response.data.data || [];
	},
};
