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
	Search,
	Filter,
	Calendar,
	Plus,
	X,
	Trash2,
	Copy,
	Clock,
	Camera,
	Image,
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
import HomePage from './src/HomePage';
import { masterApi } from './services/masterApi';
import { tenantApi, type TicketEvent } from './services/tenantApi';

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
	users: User[];

	isLoading: boolean;
	error: string | null;

	login: (mode: AuthMode, email: string, password: string) => Promise<void>;
	logout: () => void;
	setCurrentCompanyId: (id: string | null) => void;

	setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
	setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
	setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
	setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error('useAppContext deve ser usado dentro de AppProvider');
	}
	return ctx;
};// --------------------
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
	const [users, setUsers] = useState<User[]>([]);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Restaura sessão do localStorage
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
				localStorage.removeItem('gestorit_token');
				localStorage.removeItem('gestorit_mode');
				localStorage.removeItem('gestorit_user');
				localStorage.removeItem('gestorit_company_id');
			}
		}
	}, []);

	// Carrega dados iniciais
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
						'c1';

					setCurrentCompanyId(companyId);
					localStorage.setItem('gestorit_company_id', companyId);

					const [equipRes, ticketsRes, statusesRes, branchesRes, usersRes] =
						await Promise.all([
							tenantApi.getEquipments(companyId),
							tenantApi.getMaintenanceTickets(companyId),
							tenantApi.getEquipmentStatuses(companyId),
							tenantApi.getBranches(companyId),
							tenantApi.getUsers(companyId),
						]);

					setEquipment(equipRes);
					setTickets(ticketsRes);
					setStatuses(statusesRes);
					setBranches(branchesRes);
					setUsers(usersRes);
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
		setUsers([]);
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
			users,
			isLoading,
			error,
			login,
			logout,
			setCurrentCompanyId,
			setEquipment,
			setTickets,
			setCompanies,
			setUsers,
			setCurrentUser,
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
			users,
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

	const avatarSrc = (currentUser as any)?.avatarUrl || '/static/avatars/default.png';

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

						<div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
							<img
								src={avatarSrc}
								alt={currentUser.name}
								className="w-full h-full object-cover"
							/>
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
		const { equipment, statuses, branches, currentCompanyId, setEquipment } =
				useAppContext();

		const [errorMessage, setErrorMessage] = useState('');
		const [successMessage, setSuccessMessage] = useState('');
		const [search, setSearch] = useState('');
		const [filterStatus, setFilterStatus] = useState<string>('');
		const [isFormOpen, setIsFormOpen] = useState(false);
		const [editing, setEditing] = useState<Equipment | null>(null);

		// Form states
		const [formType, setFormType] = useState('');
		const [formBrand, setFormBrand] = useState('');
		const [formModel, setFormModel] = useState('');
		const [formSerial, setFormSerial] = useState('');
		const [formInternalId, setFormInternalId] = useState('');
		const [formBranchId, setFormBranchId] = useState('');
		const [formStatusId, setFormStatusId] = useState('');
		const [formDescription, setFormDescription] = useState('');
		const [formImageUrl, setFormImageUrl] = useState('');
		const [formPatrimonyId, setFormPatrimonyId] = useState('');
		const [formAcquisitionDate, setFormAcquisitionDate] = useState('');
		const [saving, setSaving] = useState(false);
		// Adicione este estado junto aos outros estados de formulário:
		const [formImageUrls, setFormImageUrls] = useState<string[]>([]); // NOVO: Lista de URLs de imagens
		const [selectedGallery, setSelectedGallery] = useState<string[] | null>(null);

		// Funções de upload e remoção(removidas):
		const filteredEquipment = useMemo(
				() =>
						equipment.filter((eq) => {
								const term = search.toLowerCase();
								const matchesSearch =
										!term ||
										eq.type.toLowerCase().includes(term) ||
										eq.brand.toLowerCase().includes(term) ||
										eq.model.toLowerCase().includes(term) ||
										eq.serialNumber.toLowerCase().includes(term) ||
										(eq.internalId ?? '').toLowerCase().includes(term);

								const matchesStatus = filterStatus ? eq.statusId === filterStatus : true;

								return matchesSearch && matchesStatus;
						}),
				[equipment, search, filterStatus]
		);

		const renderStatusBadge = (statusId: string) => {
				const st = statuses.find((s) => s.id === statusId);
				if (!st) return <span className="text-xs text-gray-400">-</span>;
				return (
						<span
								className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
								style={{ backgroundColor: `${st.color}20`, color: st.color }}
						>
								{st.name}
						</span>
				);
		};

		const clearForm = () => {
				setFormType('');
				setFormBrand('');
				setFormModel('');
				setFormSerial('');
				setFormInternalId('');
				setFormBranchId('');
				setFormStatusId('');
				setFormDescription('');
				setFormImageUrl('');
				setFormPatrimonyId('');
				setFormAcquisitionDate('');
				setFormImageUrls([]); // ✅ Limpa as imagens para o próximo uso
		};

		const setFormValues = (eq: Equipment) => {
				setFormType(eq.type);
				setFormBrand(eq.brand);
				setFormModel(eq.model);
				setFormSerial(eq.serialNumber);
				setFormInternalId(eq.internalId ?? '');
				setFormBranchId(eq.branchId ?? '');
				setFormStatusId(eq.statusId ?? '');
				setFormDescription(eq.description ?? '');
				setFormImageUrl(eq.imageUrl ?? '');
				setFormPatrimonyId(eq.patrimonyId ?? '');
				setFormAcquisitionDate(eq.acquisitionDate ?? '');
				setFormImageUrls(eq.photos ?? []); // ✅ Carrega as fotos do equipamento
		};

		const openNewForm = () => {
				setEditing(null);
				setFormType('');
				setFormBrand('');
				setFormModel('');
				setFormSerial('');
				setFormInternalId('');
				setFormBranchId('');
				setFormStatusId('');
				setFormDescription('');
				setFormImageUrl('');
				setFormPatrimonyId('');
				setFormAcquisitionDate('');
				setFormImageUrls([]); // <<< ADD ISTO
				setIsFormOpen(true);
		};

		const openEditForm = (eq: Equipment) => {
				setEditing(eq);
				setFormType(eq.type);
				setFormBrand(eq.brand);
				setFormModel(eq.model);
				setFormSerial(eq.serialNumber);
				setFormInternalId(eq.internalId ?? '');
				setFormBranchId(eq.branchId ?? '');
				setFormStatusId(eq.statusId ?? '');
				setFormDescription(eq.description ?? '');
				setFormImageUrl(eq.imageUrl ?? '');
				setFormPatrimonyId(eq.patrimonyId ?? '');
				setFormAcquisitionDate(eq.acquisitionDate ?? '');

				// ✅ CORREÇÃO: Pega as fotos do objeto 'eq' que foi passado por parâmetro
				const initialImages = eq.photos || (eq as any).imageUrls || (eq.imageUrl ? [eq.imageUrl] : []);
				setFormImageUrls(initialImages);

				setIsFormOpen(true);
		};

		const handleDelete = async () => {
				if (!editing || !currentCompanyId) return;
				if (!confirm('Deseja realmente excluir este equipamento?')) return;
				try {
						setSaving(true);
						await tenantApi.deleteEquipment(currentCompanyId, editing.id);
						setEquipment((prev) => prev.filter((e) => e.id !== editing.id));
						setIsFormOpen(false);
						setEditing(null);
				} catch (error) {
						console.error(error);
						alert('Erro ao excluir equipamento.');
				} finally {
						setSaving(false);
				}
		};

		const handleDuplicateFromList = async (e: React.MouseEvent, eq: Equipment) => {
				e.stopPropagation();
				if (!currentCompanyId) {
						alert('Empresa não selecionada.');
						return;
				}
				try {
						const duplicated = await tenantApi.duplicateEquipment(
								currentCompanyId,
								eq.id
						);
						setEquipment((prev) => [...prev, duplicated]);
				} catch (error) {
						console.error(error);
						alert('Erro ao duplicar equipamento.');
				}
		};

		const handleDeleteFromList = async (e: React.MouseEvent, eq: Equipment) => {
				e.stopPropagation();
				if (!currentCompanyId) return;
				if (!confirm('Deseja realmente excluir este equipamento?')) return;
				try {
						await tenantApi.deleteEquipment(currentCompanyId, eq.id);
						setEquipment((prev) => prev.filter((item) => item.id !== eq.id));
				} catch (error) {
						console.error(error);
						alert('Erro ao excluir equipamento.');
				}
		};

		const [uploadingPhotos, setUploadingPhotos] = useState(false);

		const handleRemoveImage = (urlToRemove: string) => {
				setFormImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
		};

		const handleEquipmentFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
				const files = Array.from(e.target.files ?? []);
				if (!files.length) return;

				if (formImageUrls.length + files.length > 20) {
						setErrorMessage("Limite máximo de 20 imagens atingido.");
						e.target.value = "";
						return;
				}

				// previews locais instantâneos
				const previewUrls = files.map((f) => URL.createObjectURL(f));
				setFormImageUrls((prev) => [...prev, ...previewUrls]);

				setUploadingPhotos(true);
				try {
						// sobe 1 por 1 (simples e confiável)
						const uploaded: string[] = [];
						for (const file of files) {
								const url = await tenantApi.uploadGenericImage(currentCompanyId!, file);
								uploaded.push(url);
						}

						// troca previews pelos urls reais
						setFormImageUrls((prev) => {
								// remove previews criados agora e coloca os reais no lugar
								const withoutPreviews = prev.filter((u) => !previewUrls.includes(u));
								return [...withoutPreviews, ...uploaded];
						});

						setSuccessMessage("Imagens enviadas com sucesso!");
				} catch (err) {
						console.error(err);
						setErrorMessage("Erro ao enviar imagens do equipamento.");
						// remove previews se falhar
						setFormImageUrls((prev) => prev.filter((u) => !previewUrls.includes(u)));
				} finally {
						setUploadingPhotos(false);
						e.target.value = "";
						// opcional: liberar memória
						previewUrls.forEach((u) => URL.revokeObjectURL(u));
				}
		};
		
		const handleSubmit = async (e: React.FormEvent) => {
				e.preventDefault();

				// validações aqui...
				if (!currentCompanyId) {
						alert('Empresa não selecionada.');
						return;
				}
				if (!formType.trim() || !formModel.trim()) {
						alert('Tipo e modelo são obrigatórios.');
						return;
				}
				
				const payload: Partial<Equipment> = {
						type: formType,
						brand: formBrand,
						model: formModel,
						serialNumber: formSerial,
						internalId: formInternalId,
						branchId: formBranchId || null,
						statusId: formStatusId || null,
						description: formDescription,
						patrimonyId: formPatrimonyId,
						acquisitionDate: formAcquisitionDate || null,
						photos: formImageUrls, // ✅ ESSENCIAL: persistir as imagens
				};

				try {
						setSaving(true);

						if (editing) {
								const updated = await tenantApi.updateEquipment(currentCompanyId, editing.id, payload);
								console.log("Retorno do servidor:", updated); // <-- Adicione isso

								// ✅ Atualiza a lista com o retorno do backend (inclui photos)
								setEquipment((prev) =>
										prev.map((e) => (e.id === updated.id ? updated : e))
								);
						} else {
								const created = await tenantApi.createEquipment(currentCompanyId, payload);
								setEquipment((prev) => [...prev, created]);
						}

						// ✅ Fecha e limpa estados do modal
						setIsFormOpen(false);
						setEditing(null);
						setFormImageUrls([]); // limpa pro próximo modal não herdar imagens antigas
				} catch (error) {
						console.error(error);
						alert('Erro ao salvar equipamento.');
				} finally {
						setSaving(false);
				}
		};
		return (
				<div className="p-6 space-y-4 relative">
						<div className="flex items-center justify-between gap-4">
								<h2 className="text-lg font-semibold text-gray-900">
										Equipamentos cadastrados
								</h2>
								<button
										onClick={openNewForm}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white"
								>
										<Plus size={14} />
										Novo Equipamento
								</button>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
								{/* Barra de busca + filtro */}
								<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="relative flex-1 min-w-[200px]">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
														<Search size={14} />
												</span>
												<input
														type="text"
														placeholder="Buscar por tipo, marca, modelo, série ou código interno..."
														className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
														value={search}
														onChange={(e) => setSearch(e.target.value)}
												/>
										</div>

										<div className="flex items-center gap-2">
												<span className="inline-flex items-center gap-1 text-xs text-gray-500">
														<Filter size={14} />
														Filtro:
												</span>
												<select
														className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
														value={filterStatus}
														onChange={(e) => setFilterStatus(e.target.value)}
												>
														<option value="">Todos os estados</option>
														{statuses.map((st) => (
															<option key={st.id} value={st.id}>
																{st.name}
															</option>
														))}
												</select>
										</div>
								</div>

								{/* Tabela */}
								<div className="overflow-x-auto">
										<table className="w-full text-sm">
												<thead>
														<tr className="text-left text-xs text-gray-500 border-b">
															<th className="py-2 px-2">Interno</th>
															<th className="py-2 px-2">Tipo</th>
															<th className="py-2 px-2">Modelo</th>
															<th className="py-2 px-2">Filial</th>
															<th className="py-2 px-2">Estado</th>
															<th className="py-2 px-2 text-right">Ações</th>
														</tr>
												</thead>
												<tbody>
														{filteredEquipment.map((eq) => {
															const br = branches.find((b) => b.id === eq.branchId);
															return (
																<tr
																	key={eq.id}
																	className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
																	onClick={() => openEditForm(eq)}
																>
																	<td className="py-2 px-2">{eq.internalId || '-'}</td>
																	<td className="py-2 px-2">{eq.type}</td>
																	<td className="py-2 px-2">{eq.model}</td>
																	<td className="py-2 px-2">{br?.name || '-'}</td>
																	<td className="py-2 px-2">{renderStatusBadge(eq.statusId)}</td>
																	<td className="py-2 px-2">
																		{eq.model}
																		{eq.photos && eq.photos.length > 0 && (
																			<span className="ml-2 text-gray-400" title={`${eq.photos.length} fotos`}>
																				<Camera size={12} className="inline" />
																			</span>
																		)}
																	</td>
																	<td className="py-2 px-2 text-right">
																		<button
																			type="button"
																			onClick={(e) => handleDuplicateFromList(e, eq)}
																			className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 mr-1"
																			title="Duplicar equipamento"
																		>
																			<Copy size={14} />
																		</button>
																		<button
																			type="button"
																			onClick={(e) => handleDeleteFromList(e, eq)}
																			className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700"
																			title="Excluir equipamento"
																		>
																			<Trash2 size={14} />
																		</button>
																	</td>
																</tr>
															);
														})}
														{filteredEquipment.length === 0 && (
															<tr>
																<td
																	colSpan={7}
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
						{/* Painel de criação/edição */}
						{isFormOpen && (
								<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
										<div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 space-y-3">
												<div className="flex justify-between items-center">
														<h3 className="text-sm font-semibold text-gray-900">
															{editing ? 'Editar Equipamento' : 'Novo Equipamento'}
														</h3>
														<button
															onClick={() => {
																setIsFormOpen(false);
																setEditing(null);
															}}
															className="text-gray-400 hover:text-gray-600"
														>
															<X size={16} />
														</button>
												</div>

												<form onSubmit={handleSubmit} className="space-y-3 text-xs">
														{/* --- SEÇÃO DE IMAGENS --- */}
														<div className="space-y-3 mb-4 p-3 border border-gray-200 rounded-lg">
															<div className="flex justify-between items-center">
																<label className="text-gray-500 text-xs">
																	Imagens do Equipamento (máx. 20)
																</label>
																<label
																	htmlFor="equipment-image-upload"
																	className={`px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium cursor-pointer transition-colors hover:bg-indigo-700 ${
																		formImageUrls.length >= 20 ? 'opacity-50 cursor-not-allowed' : ''
																	}`}
																>
																	<input
																		type="file"
																		id="equipment-image-upload"
																		multiple
																		accept="image/*"
																		onChange={handleEquipmentFilesChange}
																		className="hidden"
																		disabled={formImageUrls.length >= 20}
																	/>
																	<Plus size={14} className="inline mr-1" />
																	Upload
																</label>
															</div>

															<div className="overflow-x-auto whitespace-nowrap py-2">
																{uploadingPhotos && (
																	<div className="mt-2 text-[11px] text-gray-500">Enviando fotos...</div>
																)}

																{formImageUrls.length === 0 ? (
																	<p className="text-xs text-gray-400 text-center p-4 border border-dashed border-gray-300 rounded-md">
																		Nenhuma imagem adicionada. Use o botão "Upload" acima.
																	</p>
																) : (
																	<div className="flex gap-3">
																		{formImageUrls.map((url, index) => (
																			<div
																				key={url + index}
																				className="relative group flex-shrink-0"
																				style={{ width: 80, height: 80 }}
																			>
																				<img
																					src={url}
																					alt={`Imagem ${index + 1}`}
																					className="w-full h-full object-cover rounded-md border border-gray-300"
																				/>
																				<button
																					type="button"
																					onClick={() => handleRemoveImage(url)}
																					className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
																				>
																					<X size={12} />
																				</button>
																			</div>
																		))}
																	</div>
																)}
															</div>
														</div> 
														{/* --- FIM DA SEÇÃO DE IMAGENS --- */}

														<div className="grid grid-cols-2 gap-2">
															<div className="col-span-1">
																<label className="block text-gray-500 mb-1">ID</label>
																<input
																	className="w-full border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50 text-gray-500"
																	value={editing?.id || 'Gerado automaticamente ao salvar'}
																	readOnly
																/>
															</div>
														</div>

														<div className="grid grid-cols-2 gap-2">
															<div>
																<label className="block text-gray-500 mb-1">Tipo *</label>
																<input
																	className="w-full border border-gray-200 rounded-md px-2 py-1.5"
																	value={formType}
																	onChange={(e) => setFormType(e.target.value)}
																	required
																/>
															</div>
															<div>
																<label className="block text-gray-500 mb-1">Marca</label>
																<input
																	className="w-full border border-gray-200 rounded-md px-2 py-1.5"
																	value={formBrand}
																	onChange={(e) => setFormBrand(e.target.value)}
																/>
															</div>
															<div>
																<label className="block text-gray-500 mb-1">Modelo *</label>
																<input
																	className="w-full border border-gray-200 rounded-md px-2 py-1.5"
																	value={formModel}
																	onChange={(e) => setFormModel(e.target.value)}
																	required
																/>
															</div>
															<div>
																<label className="block text-gray-500 mb-1">Série / Serial</label>
																<input
																	className="w-full border border-gray-200 rounded-md px-2 py-1.5"
																	value={formSerial}
																	onChange={(e) => setFormSerial(e.target.value)}
																/>
															</div>
														</div>

														{/* ... Restante dos campos (InternalId, Branch, Status, Description, etc) seguem aqui ... */}
														{/* Certifique-se de manter a estrutura de fechamento abaixo: */}

														<div className="flex justify-between items-center pt-2">
															{editing && (
																<button
																	type="button"
																	onClick={handleDelete}
																	disabled={saving}
																	className="inline-flex items-center gap-1 text-red-600 text-xs hover:text-red-700"
																>
																	<Trash2 size={14} />
																	Excluir
																</button>
															)}
															<div className="flex gap-2 ml-auto">
																<button
																	type="button"
																	onClick={() => {
																		setIsFormOpen(false);
																		setEditing(null);
																	}}
																	className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600"
																>
																	Cancelar
																</button>
																<button
																	type="submit"
																	disabled={saving}
																	className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium disabled:opacity-60"
																>
																	{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar equipamento'}
																</button>
															</div>
														</div>
												</form>
										</div>
								</div>
						)}
						{/* Modal de Galeria Rápida */}
						{selectedGallery && (
								<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
										<div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
												<div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
														<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
															<Image size={18} className="text-indigo-600" />
															Galeria de Imagens
														</h3>
														<button 
															onClick={() => setSelectedGallery(null)}
															className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
														>
															<X size={20} />
														</button>
												</div>
												
												<div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
														{selectedGallery.map((url, idx) => (
															<div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
																<img 
																	src={url} 
																	alt={`Foto ${idx + 1}`} 
																	className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-300"
																	onClick={() => window.open(url, '_blank')}
																/>
																<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
															</div>
														))}
												</div>
												
												<div className="p-4 border-t bg-gray-50 text-center text-[11px] text-gray-500 italic rounded-b-lg">
														Dica: Clique na imagem para abrir o arquivo original em uma nova aba.
												</div>
										</div>
								</div>
						)}
				</div>
		);
};

const MaintenanceKanban = () => {
	const {
		equipment,
		tickets,
		setTickets,
		kanbanColumns,
		currentCompanyId,
	} = useAppContext();

	type KanbanStatus = MaintenanceTicket['kanbanStatus'];

	const columns: {
		id: string;
		title: string;
		match: KanbanStatus[];
		color: string;
	}[] = [
		{
			id: 'Aberto',
			title: 'Aberto',
			match: ['Aberto'],
			color: 'border-t-4 border-blue-500',
		},
		{
			id: 'Em Andamento',
			title: 'Em Andamento',
			match: ['Em Manutenção', 'Em Análise', 'Aguardando Peça'],
			color: 'border-t-4 border-yellow-500',
		},
		{
			id: 'Concluído',
			title: 'Concluído',
			match: ['Concluído'],
			color: 'border-t-4 border-green-500',
		},
	];

	const [creating, setCreating] = useState(false);
	const [newTitle, setNewTitle] = useState('');
	const [newDescription, setNewDescription] = useState('');
	const [newEquipmentId, setNewEquipmentId] = useState<string>('');
	const [draggingId, setDraggingId] = useState<string | null>(null);
	
	const openTicketModal = (ticket: MaintenanceTicket) => {
		setSelectedTicket(ticket);
		setEditTitle(ticket.title || '');
		setEditDescription(ticket.description || '');
		setEditPriority(ticket.priority || 'media');
		setEditDueDate(ticket.dueDate || '');
		setEditEquipmentId(ticket.equipmentId || '');
	};

	const handleSaveTicket = async () => {
		if (!selectedTicket || !currentCompanyId) return;

		setSavingEdit(true);
		try {
			const updated = await tenantApi.updateTicket(currentCompanyId, selectedTicket.id, {
				title: editTitle,
				description: editDescription,
				priority: editPriority,
				dueDate: editDueDate,
				equipmentId: editEquipmentId || null,
			});

			setTickets((prev) =>
				prev.map((t) => (t.id === updated.id ? updated : t))
			);
			setSelectedTicket(null);
		} catch (error) {
			console.error(error);
			alert('Erro ao salvar o chamado.');
		} finally {
			setSavingEdit(false);
		}
	};

	const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
	const [editTitle, setEditTitle] = useState('');
	const [editDescription, setEditDescription] = useState('');
	const [editPriority, setEditPriority] = useState<MaintenanceTicket['priority']>('media');
	const [editDueDate, setEditDueDate] = useState('');
	const [editEquipmentId, setEditEquipmentId] = useState<string>('');
	const [savingEdit, setSavingEdit] = useState(false);

	const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
		e.dataTransfer.setData('ticketId', id);
		setDraggingId(id);
	};

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const resolveNewStatus = (columnId: string): KanbanStatus => {
		if (columnId === 'Aberto') return 'Aberto';
		if (columnId === 'Concluído') return 'Concluído';
		return 'Em Manutenção';
	};

	const handleMoveTicket = async (ticketId: string, columnId: string) => {
		const newStatus = resolveNewStatus(columnId);

		setTickets((prev) =>
			prev.map((t) =>
				t.id === ticketId ? { ...t, kanbanStatus: newStatus } : t
			)
		);

		if (!currentCompanyId) return;

		try {
			await tenantApi.moveTicket(currentCompanyId, ticketId, newStatus);
		} catch (error) {
			console.error('Erro ao atualizar chamado via API', error);
		}
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
		e.preventDefault();
		const id = e.dataTransfer.getData('ticketId');
		setDraggingId(null);
		if (!id) return;
		handleMoveTicket(id, columnId);
	};

	const getPriorityClass = (priority: MaintenanceTicket['priority']) => {
		switch (priority) {
			case 'Crítica':
				return 'bg-red-100 text-red-800';
			case 'Alta':
				return 'bg-orange-100 text-orange-800';
			case 'Média':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-blue-100 text-blue-800';
		}
	};

	const grouped = useMemo(() => {
		const result: Record<string, MaintenanceTicket[]> = {};
		columns.forEach((col) => {
			result[col.id] = tickets.filter((t) => col.match.includes(t.kanbanStatus));
		});
		return result;
	}, [tickets]);

	const [timelineTicket, setTimelineTicket] = useState<MaintenanceTicket | null>(null);
	const [timelineEvents, setTimelineEvents] = useState<TicketEvent[]>([]);
	const [timelineLoading, setTimelineLoading] = useState(false);

	const openTimeline = async (ticket: MaintenanceTicket) => {
		if (!currentCompanyId) return;
		setTimelineTicket(ticket);
		setTimelineLoading(true);
		try {
			const events = await tenantApi.getTicketTimeline(currentCompanyId, ticket.id);
			setTimelineEvents(events);
		} catch (error) {
			console.error(error);
			alert('Erro ao carregar timeline do chamado.');
		} finally {
			setTimelineLoading(false);
		}
	};

	const handleCreateTicket = async () => {
		if (!currentCompanyId) {
			alert('Empresa não selecionada.');
			return;
		}
		if (!newTitle.trim()) return;

		try {
			setCreating(true);
			const created = await tenantApi.createTicket(currentCompanyId, {
				title: newTitle,
				description: newDescription,
				equipmentId: newEquipmentId || undefined,
				kanbanStatus: 'Aberto',
				priority: 'Média',
			});
			setTickets((prev) => [...prev, created]);
			setNewTitle('');
			setNewDescription('');
			setNewEquipmentId('');
		} catch (error) {
			console.error('Erro ao criar chamado', error);
			alert('Erro ao criar chamado. Verifique o console.');
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="p-6 h-[calc(100vh-64px)] flex flex-col">
			<div className="flex justify-between items-center mb-4">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">
						Quadro de Manutenção
					</h2>
					<p className="text-xs text-gray-500">
						Arraste os chamados entre as colunas para atualizar o status.
					</p>
				</div>
				<div className="flex gap-2">
						<button
							type="button"
							onClick={() =>
								alert('Abra a timeline clicando no botão "Timeline" em cada card de chamado.')
							}
							className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5"
						>
							<Calendar size={14} />
							Linha do Tempo
						</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-md p-3 mb-4 flex flex-col md:flex-row gap-2 md:items-end">
				<div className="flex-1">
					<label className="block text-xs text-gray-500 mb-1">
						Título do chamado
					</label>
					<input
						type="text"
						className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						placeholder="Ex.: Computador travando"
					/>
				</div>
				<div className="flex-1">
					<label className="block text-xs text-gray-500 mb-1">
						Equipamento
					</label>
					<select
						className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
						value={newEquipmentId}
						onChange={(e) => setNewEquipmentId(e.target.value)}
					>
						<option value="">Sem vínculo específico</option>
						{equipment.map((eq) => (
							<option key={eq.id} value={eq.id}>
								{eq.internalId || eq.type} - {eq.model}
							</option>
						))}
					</select>
				</div>
				<button
					type="button"
					onClick={handleCreateTicket}
					disabled={creating}
					className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white disabled:opacity-60"
				>
					{creating ? (
						'Criando...'
					) : (
						<>
							<Plus size={14} className="mr-1" />
							Novo Chamado
						</>
					)}
				</button>
			</div>

			<div className="flex-1 flex gap-4 overflow-x-auto pb-4">
				{columns.map((col) => (
					<div
						key={col.id}
						className={`flex-1 min-w-[260px] bg-gray-50 rounded-lg flex flex-col border border-gray-200 ${col.color}`}
						onDragOver={onDragOver}
						onDrop={(e) => onDrop(e, col.id)}
					>
						<div className="px-3 py-2 flex items-center justify-between sticky top-0 bg-gray-50 rounded-t-lg z-10">
							<span className="text-xs font-semibold text-gray-700">
								{col.title}
							</span>
							<span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px]">
								{grouped[col.id]?.length || 0}
							</span>
						</div>
						<div className="px-3 pb-3 space-y-2 overflow-y-auto flex-1">
							{grouped[col.id]?.map((t) => (
								<div
									key={t.id}
									className={`bg-white rounded-md border border-gray-200 p-2 text-xs cursor-move shadow-sm ${
										draggingId === t.id ? 'opacity-70' : ''
									}`}
									draggable
									onDragStart={(e) => onDragStart(e, t.id)}
									onClick={(e) => {
										// evita conflito com drag
										e.stopPropagation();
										openTicketModal(t);
									}}
								>
									<div className="flex items-center justify-between gap-2">
										<div className="font-semibold text-gray-800 truncate">
											{t.title || 'Chamado'}
										</div>
										<span
											className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityClass(
												t.priority
											)}`}
										>
											{t.priority}
										</span>
									</div>
									{t.description && (
										<div className="text-gray-600 mt-1 line-clamp-2">
											{t.description}
										</div>
									)}
										<div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
											<span>Vencimento: {t.dueDate || '-'}</span>
											<button
												type="button"
												onClick={() => openTimeline(t)}
												className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
											>
												<Clock size={10} />
												Timeline
											</button>
										</div>
								</div>
							))}
							{!grouped[col.id]?.length && (
								<div className="text-[11px] text-gray-400">
									Nenhum chamado nesta coluna.
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Modal de Timeline */}
			{timelineTicket && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 text-xs">
						<div className="flex items-center justify-between mb-3">
							<div>
								<h3 className="text-sm font-semibold text-gray-900">
									Timeline do chamado
								</h3>
								<p className="text-[11px] text-gray-500">
									{timelineTicket.title} — ID: {timelineTicket.id}
								</p>
							</div>
							<button
								type="button"
								onClick={() => {
									setTimelineTicket(null);
									setTimelineEvents([]);
								}}
								className="text-gray-400 hover:text-gray-600"
							>
								<X size={16} />
							</button>
						</div>

						<div className="border border-gray-100 rounded-md max-h-80 overflow-y-auto p-3 space-y-2">
							{timelineLoading && (
								<div className="text-[11px] text-gray-500">
									Carregando eventos...
								</div>
							)}

							{!timelineLoading && timelineEvents.length === 0 && (
								<div className="text-[11px] text-gray-400">
									Nenhum evento registrado para este chamado ainda.
								</div>
							)}

							{!timelineLoading &&
								timelineEvents.map((ev) => (
									<div
										key={ev.id}
										className="border border-gray-100 rounded-md px-2 py-1.5"
									>
										<div className="flex items-center justify-between">
											<span className="text-[11px] font-semibold text-gray-800">
												{ev.type === 'created'
													? 'Chamado criado'
													: 'Status atualizado'}
											</span>
											<span className="text-[10px] text-gray-400">
												{new Date(ev.createdAt).toLocaleString('pt-BR')}
											</span>
										</div>

										{(ev.fromStatus || ev.toStatus) && (
											<div className="text-[11px] text-gray-600 mt-1">
												{ev.fromStatus && (
													<>
														<span className="font-medium">De:</span>{' '}
														<span>{ev.fromStatus}</span>
													</>
												)}
												{ev.fromStatus && ev.toStatus && <span> → </span>}
												{ev.toStatus && (
													<>
														<span className="font-medium">Para:</span>{' '}
														<span>{ev.toStatus}</span>
													</>
												)}
											</div>
										)}

										{ev.note && ev.note.trim() && (
											<div className="mt-1 text-[11px] text-gray-500">
												{ev.note}
											</div>
										)}
									</div>
								))}
						</div>
					</div>
				</div>
			)}

			{/* Modal de Edição de Chamado */}
			{selectedTicket && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 space-y-3 text-xs">
						<div className="flex justify-between items-center">
							<h3 className="text-sm font-semibold text-gray-900">
								Editar Chamado
							</h3>
							<button
								type="button"
								className="text-gray-400 hover:text-gray-600"
								onClick={() => setSelectedTicket(null)}
							>
								<X size={16} />
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<label className="block text-gray-500 mb-1">Título</label>
								<input
									className="w-full border border-gray-200 rounded-md px-2 py-1.5"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
								/>
							</div>

							<div>
								<label className="block text-gray-500 mb-1">Descrição</label>
								<textarea
									className="w-full border border-gray-200 rounded-md px-2 py-1.5 min-h-[80px]"
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
								/>
							</div>

							<div className="flex gap-3">
								<div className="flex-1">
									<label className="block text-gray-500 mb-1">Prioridade</label>
									<select
										className="w-full border border-gray-200 rounded-md px-2 py-1.5"
										value={editPriority}
										onChange={(e) =>
											setEditPriority(
												e.target.value as MaintenanceTicket['priority']
											)
										}
									>
										<option value="baixa">Baixa</option>
										<option value="media">Média</option>
										<option value="alta">Alta</option>
										<option value="critica">Crítica</option>
									</select>
								</div>
								<div className="flex-1">
									<label className="block text-gray-500 mb-1">
										Vencimento
									</label>
									<input
										type="date"
										className="w-full border border-gray-200 rounded-md px-2 py-1.5"
										value={editDueDate}
										onChange={(e) => setEditDueDate(e.target.value)}
									/>
								</div>
							</div>

							<div>
								<label className="block text-gray-500 mb-1">
									Equipamento vinculado
								</label>
								<select
									className="w-full border border-gray-200 rounded-md px-2 py-1.5"
									value={editEquipmentId}
									onChange={(e) => setEditEquipmentId(e.target.value)}
								>
									<option value="">Sem vínculo</option>
									{equipment.map((eq) => (
										<option key={eq.id} value={eq.id}>
											{eq.internalId || eq.type} - {eq.model}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								className="px-3 py-1.5 rounded-md border border-gray-200 text-xs"
								onClick={() => setSelectedTicket(null)}
							>
								Cancelar
							</button>
							<button
								type="button"
								disabled={savingEdit}
								onClick={handleSaveTicket}
								className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium disabled:opacity-60"
							>
								{savingEdit ? 'Salvando...' : 'Salvar alterações'}
							</button>
						</div>
					</div>
				</div>
			)}
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
	const { companies, setCompanies } = useAppContext();
	const [name, setName] = useState('');
	const [cnpj, setCnpj] = useState('');
	const [plan, setPlan] = useState('STARTER');
	const [isSaving, setIsSaving] = useState(false);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		try {
			setIsSaving(true);
			const created = await masterApi.createCompany({
				name,
				cnpj,
				plan,
			});
			setCompanies((prev) => [...prev, created]);
			setName('');
			setCnpj('');
			setPlan('STARTER');
		} catch (error) {
			console.error('Erro ao criar empresa', error);
			alert('Erro ao criar empresa. Verifique o console.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteCompany = async (companyId: string) => {
		if (!window.confirm('Deseja realmente excluir esta empresa?')) return;

		try {
			await masterApi.deleteCompany(companyId);
			setCompanies((prev) => prev.filter((c) => c.id !== companyId));
		} catch (error) {
			console.error(error);
			alert('Erro ao excluir empresa.');
		}
	};

	return (
		<div className="p-6 space-y-4">
			<h2 className="text-lg font-semibold text-gray-100">Empresas Clientes</h2>

			{/* Formulário simples de nova empresa */}
			<form
				onSubmit={handleCreate}
				className="bg-slate-900 rounded-lg border border-slate-700 p-4 flex flex-col md:flex-row gap-3 md:items-end"
			>
				<div className="flex-1">
					<label className="block text-xs text-slate-400 mb-1">
						Nome da empresa
					</label>
					<input
						type="text"
						className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Ex.: Empresa Exemplo LTDA"
					/>
				</div>
				<div>
					<label className="block text-xs text-slate-400 mb-1">CNPJ</label>
					<input
						type="text"
						className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						value={cnpj}
						onChange={(e) => setCnpj(e.target.value)}
						placeholder="00.000.000/0001-00"
					/>
				</div>
				<div>
					<label className="block text-xs text-slate-400 mb-1">Plano</label>
					<select
						className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						value={plan}
						onChange={(e) => setPlan(e.target.value)}
					>
						<option value="STARTER">STARTER</option>
						<option value="PRO">PRO</option>
						<option value="ENTERPRISE">ENTERPRISE</option>
					</select>
				</div>
				<button
					type="submit"
					disabled={isSaving}
					className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white disabled:opacity-60"
				>
					{isSaving ? 'Salvando...' : 'Nova Empresa'}
				</button>
			</form>

			{/* Tabela de empresas */}
			<div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-slate-100">
						<thead>
							<tr className="text-xs text-slate-400 border-b border-slate-700">
								<th className="py-2 text-left">ID</th>
								<th className="py-2 text-left">Empresa</th>
								<th className="py-2 text-left">CNPJ</th>
								<th className="py-2 text-left">Plano</th>
								<th className="py-2 text-left">Status</th>
								<th className="py-2 text-right">Ações</th>
							</tr>
						</thead>
						<tbody>
							{companies.map((c) => (
								<tr key={c.id} className="border-b border-slate-800 last:border-0">
									<td className="py-2 text-xs text-slate-400">{c.id}</td>
									<td className="py-2">
										<div className="text-sm font-medium text-slate-100">
											{c.name}
										</div>
										<div className="text-[11px] text-slate-400">
											{c.contactEmail || 'sem e-mail cadastrado'}
										</div>
									</td>
									<td className="py-2 text-xs">{c.cnpj}</td>
									<td className="py-2 text-xs">{c.plan}</td>
									<td className="py-2 text-xs">
										{(c as any).status === 'SUSPENSA' ? (
											<span className="text-amber-400">Suspensa</span>
										) : (c as any).isOverdue ? (
											<span className="text-red-400">Inadimplente</span>
										) : (
											<span className="text-emerald-400">Ativa</span>
										)}
									</td>
									<td className="py-2 text-right">
										<button
											type="button"
											onClick={() => handleDeleteCompany(c.id)}
											className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-200 text-xs"
											title="Excluir empresa"
										>
											<Trash2 size={14} />
										</button>
									</td>
								</tr>
							))}
							{companies.length === 0 && (
								<tr>
									<td
										colSpan={6}
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
								mode === 'master' ? 'master@gestorit.com' : 'admin@gestorit.com'
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
// Menu Usuários do Tenant (Router)
// --------------------

const TenantUsersPage = () => {
	const { users, setUsers, currentCompanyId, currentUser, setCurrentUser } =
		useAppContext();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('leitura');
	// criação
	const [avatar, setAvatar] = useState('');
	const [avatarSource, setAvatarSource] = useState<'url' | 'file' | 'drive'>(
		'url'
	);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	// edição
	const [editAvatar, setEditAvatar] = useState('');
	const [editAvatarSource, setEditAvatarSource] = useState<
		'url' | 'file' | 'drive'
	>('url');
	const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
	const [savingNew, setSavingNew] = useState(false);

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editName, setEditName] = useState('');
	const [editEmail, setEditEmail] = useState('');
	const [editRole, setEditRole] = useState('leitura');
	const [editActive, setEditActive] = useState(true);
	const [savingEdit, setSavingEdit] = useState(false);

	const openUserDetails = (u: User) => {
		setSelectedUser(u);
		setEditName(u.name);
		setEditEmail(u.email);
		setEditRole((u as any).role || 'leitura');
		setEditActive((u as any).active !== false);
		setEditAvatar((u as any).avatarUrl || '');
		setEditAvatarSource('url');
		setEditAvatarFile(null);
	};

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentCompanyId) {
			alert('Empresa não selecionada.');
			return;
		}
		if (!name.trim() || !email.trim()) {
			alert('Nome e e-mail são obrigatórios.');
			return;
		}

		try {
			setSavingNew(true);
			const created = await tenantApi.createUser(currentCompanyId, {
				name,
				email,
				role,
				active: true,
				avatarUrl: avatar || undefined,
			});

			setUsers((prev) => [...prev, created]);
			setName('');
			setEmail('');
			setRole('leitura');
			setAvatar(''); // Limpar avatar após criar
		} catch (error) {
			console.error(error);
			alert('Erro ao criar usuário.');
		} finally {
			setSavingNew(false);
		}
	};

	const handleSaveUser = async () => {
		if (!selectedUser || !currentCompanyId) return;

		try {
			setSavingEdit(true);
			const updated = await tenantApi.updateUser(
				currentCompanyId,
				selectedUser.id,
				{
					name: editName,
					email: editEmail,
					role: editRole,
					active: editActive,
					avatarUrl: editAvatar || undefined,
				}
			);

			setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
			setSelectedUser(updated);

			if (currentUser && currentUser.id === updated.id) {
				setCurrentUser(updated);
				localStorage.setItem('gestorit_user', JSON.stringify(updated));
			}
		} catch (err) {
			console.error(err);
			alert('Erro ao salvar usuário.');
		} finally {
			setSavingEdit(false);
		}
	};

	const handleNewAvatarFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const url = await tenantApi.uploadAvatar(file);
			setAvatar(url);
			setAvatarFile(file);
			setAvatarSource('file');
		} catch (error) {
			console.error(error);
			alert('Erro ao enviar avatar.');
		}
	};

	const handleEditAvatarFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const url = await tenantApi.uploadAvatar(file);
			setEditAvatar(url);
			setEditAvatarFile(file);
			setEditAvatarSource('file');
		} catch (error) {
			console.error(error);
			alert('Erro ao enviar avatar.');
		}
	};

	const handleToggleActive = async () => {
		if (!selectedUser || !currentCompanyId) return;
		try {
			setSavingEdit(true);
			const updated = await tenantApi.suspendUser(
				currentCompanyId,
				selectedUser.id,
				!editActive
			);
			setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
			setEditActive(updated.active ?? true);
			setSelectedUser(updated);
		} catch (error) {
			console.error(error);
			alert('Erro ao alterar status do usuário.');
		} finally {
			setSavingEdit(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!selectedUser || !currentCompanyId) return;
		if (!confirm('Deseja realmente excluir este usuário?')) return;

		try {
			setSavingEdit(true);
			await tenantApi.deleteUser(currentCompanyId, selectedUser.id);
			setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
			setSelectedUser(null);
		} catch (error) {
			console.error(error);
			alert('Erro ao excluir usuário.');
		} finally {
			setSavingEdit(false);
		}
	};

	const handleDeleteFromList = async (e: React.MouseEvent, user: User) => {
		e.stopPropagation();
		if (!currentCompanyId) return;
		if (!window.confirm('Deseja realmente excluir este usuário?')) return;

		try {
			await tenantApi.deleteUser(currentCompanyId, user.id);
			setUsers((prev) => prev.filter((u) => u.id !== user.id));
			if (selectedUser?.id === user.id) {
				setSelectedUser(null);
			}
		} catch (error) {
			console.error(error);
			alert('Erro ao excluir usuário.');
		}
	};

	const effectiveAvatar = selectedUser
		? editAvatar ||
			(selectedUser as any).avatarUrl ||
			'/static/avatars/default.png'
		: '/static/avatars/default.png';
		return (
		<div className="p-6 space-y-4 relative">
			<h2 className="text-lg font-semibold text-gray-900">
				Usuários da Empresa
			</h2>

			{/* Form de novo usuário (Layout Otimizado) */}
			<form
				onSubmit={handleCreateUser}
				className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3 md:items-end text-xs"
			>
				<div className="flex-1">
					<label className="block text-gray-500 mb-1">Nome *</label>
					<input
						className="w-full border border-gray-200 rounded-md px-2 py-1.5"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Nome completo"
					/>
				</div>

				<div className="flex-1">
					<label className="block text-gray-500 mb-1">E-mail *</label>
					<input
						type="email"
						className="w-full border border-gray-200 rounded-md px-2 py-1.5"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="email@empresa.com"
					/>
				</div>

				<div>
					<label className="block text-gray-500 mb-1">Papel</label>
					<select
						className="border border-gray-200 rounded-md px-2 py-1.5"
						value={role}
						onChange={(e) => setRole(e.target.value)}
					>
						<option value="leitura">Leitura</option>
						<option value="tecnico">Técnico</option>
						<option value="gestor_ti">Gestor TI</option>
						<option value="admin_empresa">Admin Empresa</option>
					</select>
				</div>

				{/* BLOCO AVATAR */}
				<div className="flex-1 flex flex-col">
					<div className="flex justify-between items-center mb-1">
						<label className="text-gray-500">Avatar</label>
						<button
							type="button"
							onClick={() => {
								setAvatar('/static/avatars/default.png');
								setAvatarSource('url');
							}}
							className="text-[10px] text-gray-500 hover:text-gray-700 underline"
						>
							Usar avatar padrão
						</button>
					</div>

					<div className="flex items-end gap-3">
						<div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
							<img
								src={avatar || '/static/avatars/default.png'}
								alt="Avatar preview"
								className="w-full h-full object-cover"
							/>
						</div>

						<div className="flex gap-2 flex-1">
							<select
								className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-28 shrink-0"
								value={avatarSource}
								onChange={(e) =>
									setAvatarSource(e.target.value as 'url' | 'file' | 'drive')
								}
							>
								<option value="url">URL</option>
								<option value="file">Dispositivo</option>
								<option value="drive">Drive</option>
							</select>

							<div className="flex-1 min-w-[100px]">
								{avatarSource === 'url' && (
									<input
										className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs"
										value={avatar}
										onChange={(e) => setAvatar(e.target.value)}
										placeholder="https://... (opcional)"
									/>
								)}
								{avatarSource === 'file' && (
									<input
										type="file"
										accept="image/*"
										className="w-full text-[11px] py-1.5"
										onChange={handleNewAvatarFileChange}
									/>
								)}
								{avatarSource === 'drive' && (
									<input
										className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-[11px]"
										placeholder="Drive em breve"
										disabled
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center">
					<button
						type="submit"
						disabled={savingNew}
						className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white disabled:opacity-60 h-[34px]"
					>
						{savingNew ? 'Salvando...' : 'Adicionar usuário'}
					</button>
				</div>
			</form>

			{/* Lista de usuários */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs text-gray-500 border-b">
								<th className="py-2 px-2">Nome</th>
								<th className="py-2 px-2">E-mail</th>
								<th className="py-2 px-2">Papel</th>
								<th className="py-2 px-2">Status</th>
								<th className="py-2 px-2 text-right">Ações</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u) => (
								<tr
									key={u.id}
									className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
									onClick={() => openUserDetails(u)}
								>
									<td className="py-2 px-2">{u.name}</td>
									<td className="py-2 px-2 text-xs text-gray-600">{u.email}</td>
									<td className="py-2 px-2 text-xs">{(u as any).role || '-'}</td>
									<td className="py-2 px-2 text-xs">
										{(u as any).active === false ? (
											<span className="text-red-600">Inativo</span>
										) : (
											<span className="text-green-600">Ativo</span>
										)}
									</td>
									<td className="py-2 px-2 text-right">
										<button
											type="button"
											onClick={(e) => handleDeleteFromList(e, u)}
											className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700"
											title="Excluir usuário"
										>
											<Trash2 size={14} />
										</button>
									</td>
								</tr>
							))}
							{users.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="py-4 text-center text-xs text-gray-500"
									>
										Nenhum usuário cadastrado.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Painel de detalhes/edição (Layout Otimizado) */}
			{selectedUser && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
						<div className="flex justify-between items-center pb-2 border-b border-gray-100">
							<h3 className="text-base font-semibold text-gray-900">
								Detalhes e Edição do Usuário
							</h3>
							<button
								onClick={() => setSelectedUser(null)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X size={18} />
							</button>
						</div>

						<div className="flex items-start gap-6">
							{/* Bloco Avatar */}
							<div className="flex flex-col items-center gap-2 pt-1 w-32 shrink-0">
								<div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500 shadow-md">
									<img
										src={effectiveAvatar}
										alt={selectedUser.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<button
									type="button"
									onClick={() => {
										setEditAvatar('/static/avatars/default.png');
										setEditAvatarSource('url');
									}}
									className="text-[10px] text-gray-500 hover:text-gray-700 underline"
								>
									Usar Padrão
								</button>
							</div>

							{/* Dados e Controles */}
							<div className="flex-1 space-y-3">
								<div className="flex flex-col mb-4">
									<div className="text-sm text-gray-700 font-semibold">
										{selectedUser.name}
									</div>
									<div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
										<span className="font-medium">ID:</span>
										<span className="text-gray-600">{selectedUser.id}</span>
										<span className="mx-1 text-gray-300">|</span>
										<span className="font-medium">Email:</span>
										<span className="text-gray-600">{selectedUser.email}</span>
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-900 mb-1">
										Alterar Avatar
									</label>
									<div className="flex gap-2">
										<select
											className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-28 shrink-0"
											value={editAvatarSource}
											onChange={(e) =>
												setEditAvatarSource(
													e.target.value as 'url' | 'file' | 'drive'
												)
											}
										>
											<option value="url">URL</option>
											<option value="file">Dispositivo</option>
											<option value="drive">Drive</option>
										</select>

										<div className="flex-1">
											{editAvatarSource === 'url' && (
												<input
													className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs"
													value={editAvatar}
													onChange={(e) => setEditAvatar(e.target.value)}
													placeholder="https://..."
												/>
											)}
											{editAvatarSource === 'file' && (
												<input
													type="file"
													accept="image/*"
													className="w-full text-xs py-1.5"
													onChange={handleEditAvatarFileChange}
												/>
											)}
											{editAvatarSource === 'drive' && (
												<input
													className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs"
													placeholder="Drive em breve"
													disabled
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						<hr className="my-3 border-gray-100" />

						{/* Campos de Edição Geral */}
						<div className="space-y-3 text-xs">
							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-gray-500 mb-1">Nome</label>
									<input
										className="w-full border border-gray-200 rounded-md px-2 py-1.5"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
									/>
								</div>
								<div className="flex-1">
									<label className="block text-gray-500 mb-1">E-mail</label>
									<input
										className="w-full border border-gray-200 rounded-md px-2 py-1.5"
										value={editEmail}
										onChange={(e) => setEditEmail(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex gap-4 items-center">
								<div>
									<label className="block text-gray-500 mb-1">Papel</label>
									<select
										className="border border-gray-200 rounded-md px-2 py-1.5"
										value={editRole}
										onChange={(e) => setEditRole(e.target.value)}
									>
										<option value="leitura">Leitura</option>
										<option value="tecnico">Técnico</option>
										<option value="gestor_ti">Gestor TI</option>
										<option value="admin_empresa">Admin Empresa</option>
									</select>
								</div>

								<div className="flex items-center gap-2 pt-5">
									<input
										id="user-active"
										type="checkbox"
										checked={editActive}
										onChange={(e) => setEditActive(e.target.checked)}
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
									/>
									<label
										htmlFor="user-active"
										className="text-xs text-gray-600"
									>
										Ativo
									</label>
								</div>
							</div>
						</div>

						<hr className="my-3 border-gray-100" />

						<div className="flex justify-between items-center pt-2">
							<button
								type="button"
								disabled={savingEdit}
								onClick={handleDeleteUser}
								className="inline-flex items-center gap-1 text-red-600 text-xs hover:text-red-700 disabled:opacity-60"
							>
								<Trash2 size={14} />
								Excluir usuário
							</button>

							<div className="flex gap-2 ml-auto">
								<button
									type="button"
									onClick={handleToggleActive}
									disabled={savingEdit}
									className="px-3 py-1.5 rounded-md border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-60"
								>
									{editActive ? 'Suspender' : 'Reativar'}
								</button>

								<button
									type="button"
									disabled={savingEdit}
									onClick={handleSaveUser}
									className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium disabled:opacity-60 hover:bg-indigo-700"
								>
									{savingEdit ? 'Salvando...' : 'Salvar alterações'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
// --------------------
// Layout organizado com seções de Tipos e Modelos de equipamentos
// --------------------

const SettingsPage = () => {
	const [types, setTypes] = useState<string[]>([
		'Notebook',
		'Desktop',
		'Monitor',
	]);
	const [models, setModels] = useState<string[]>(['Dell Inspiron 15']);
	const [customStatuses, setCustomStatuses] = useState<string[]>([
		'Aguardando peça',
	]);

	const [newType, setNewType] = useState('');
	const [newModel, setNewModel] = useState('');
	const [newStatus, setNewStatus] = useState('');

	const addType = () => {
		if (!newType.trim()) return;
		setTypes((prev) => [...prev, newType.trim()]);
		setNewType('');
	};

	const addModel = () => {
		if (!newModel.trim()) return;
		setModels((prev) => [...prev, newModel.trim()]);
		setNewModel('');
	};

	const addStatus = () => {
		if (!newStatus.trim()) return;
		setCustomStatuses((prev) => [...prev, newStatus.trim()]);
		setNewStatus('');
	};

	const removeItem = (
		list: string[],
		setter: React.Dispatch<React.SetStateAction<string[]>>,
		value: string
	) => {
		setter(list.filter((item) => item !== value));
	};

	return (
		<div className="p-6 space-y-4">
			<h2 className="text-lg font-semibold text-gray-900">
				Configurações da Empresa
			</h2>

			<div className="grid md:grid-cols-3 gap-4">
				{/* Tipos de equipamento */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
					<h3 className="text-sm font-semibold text-gray-800">
						Tipos de Equipamento
					</h3>
					<p className="text-xs text-gray-500">
						Defina os tipos mais comuns utilizados nesta empresa (ex.: Notebook,
						Desktop, Monitor).
					</p>

					<div className="flex gap-2 text-xs">
						<input
							className="flex-1 border border-gray-200 rounded-md px-2 py-1.5"
							value={newType}
							onChange={(e) => setNewType(e.target.value)}
							placeholder="Novo tipo..."
						/>
						<button
							type="button"
							onClick={addType}
							className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
						>
							Adicionar
						</button>
					</div>

					<ul className="mt-2 space-y-1 text-xs">
						{types.map((t) => (
							<li
								key={t}
								className="flex justify-between items-center border border-gray-100 rounded-md px-2 py-1"
							>
								<span>{t}</span>
								<button
									type="button"
									onClick={() => removeItem(types, setTypes, t)}
									className="text-gray-400 hover:text-red-500"
								>
									<Trash2 size={14} />
								</button>
							</li>
						))}
						{types.length === 0 && (
							<li className="text-[11px] text-gray-400">
								Nenhum tipo cadastrado.
							</li>
						)}
					</ul>

					<p className="text-[11px] text-gray-400 pt-2">
						Em breve: sincronização com tipos globais definidos pelo Painel
						Master e envio de sugestões com base no uso real.
					</p>
				</div>

				{/* Modelos */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
					<h3 className="text-sm font-semibold text-gray-800">Modelos</h3>
					<p className="text-xs text-gray-500">
						Mantenha um catálogo de modelos frequentes para agilizar o cadastro.
					</p>

					<div className="flex gap-2 text-xs">
						<input
							className="flex-1 border border-gray-200 rounded-md px-2 py-1.5"
							value={newModel}
							onChange={(e) => setNewModel(e.target.value)}
							placeholder="Novo modelo..."
						/>
						<button
							type="button"
							onClick={addModel}
							className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
						>
							Adicionar
						</button>
					</div>

					<ul className="mt-2 space-y-1 text-xs">
						{models.map((m) => (
							<li
								key={m}
								className="flex justify-between items-center border border-gray-100 rounded-md px-2 py-1"
							>
								<span>{m}</span>
								<button
									type="button"
									onClick={() => removeItem(models, setModels, m)}
									className="text-gray-400 hover:text-red-500"
								>
									<Trash2 size={14} />
								</button>
							</li>
						))}
						{models.length === 0 && (
							<li className="text-[11px] text-gray-400">
								Nenhum modelo cadastrado.
							</li>
						)}
					</ul>

					<p className="text-[11px] text-gray-400 pt-2">
						Em breve: auto-sugestão a partir dos equipamentos criados e envio
						automático de novos modelos para a base Master.
					</p>
				</div>

				{/* Estados customizados */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
					<h3 className="text-sm font-semibold text-gray-800">
						Estados customizados
					</h3>
					<p className="text-xs text-gray-500">
						Além dos estados padrão (Funcionando, Em manutenção, etc.), defina
						estados específicos para esta empresa.
					</p>

					<div className="flex gap-2 text-xs">
						<input
							className="flex-1 border border-gray-200 rounded-md px-2 py-1.5"
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
							placeholder="Novo estado..."
						/>
						<button
							type="button"
							onClick={addStatus}
							className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
						>
							Adicionar
						</button>
					</div>

					<ul className="mt-2 space-y-1 text-xs">
						{customStatuses.map((s) => (
							<li
								key={s}
								className="flex justify-between items-center border border-gray-100 rounded-md px-2 py-1"
							>
								<span>{s}</span>
								<button
									type="button"
									onClick={() =>
										removeItem(customStatuses, setCustomStatuses, s)
									}
									className="text-gray-400 hover:text-red-500"
								>
									<Trash2 size={14} />
								</button>
							</li>
						))}
						{customStatuses.length === 0 && (
							<li className="text-[11px] text-gray-400">
								Nenhum estado customizado.
							</li>
						)}
					</ul>

					<p className="text-[11px] text-gray-400 pt-2">
						Em breve: integração com o cadastro de estados globais e propagação
						desses estados para o histórico de equipamentos.
					</p>
				</div>
			</div>
		</div>
	);
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
						{/* Home pública (nova landing page) */}
						<Route path="/" element={<HomePage />} />

						{/* Login existente */}
						<Route path="/login" element={<LoginPage />} />

						{/* Área Tenant (empresa cliente/prestadora) */}
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
							<Route path="usuarios" element={<TenantUsersPage />} />
							<Route path="configuracoes" element={<SettingsPage />} />
						</Route>

						{/* Painel Master (SaaS) */}
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

						{/* Fallback: qualquer rota desconhecida volta para a Home */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</HashRouter>
			</AppProvider>
		</React.StrictMode>
	);
};

export default App;