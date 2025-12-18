import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Building2,
	CheckCircle2,
	LayoutDashboard,
	Monitor,
	Wrench,
	BarChart3,
	Smartphone,
	ShieldCheck,
	Users,
	Play,
	ArrowRight,
	Menu,
	X,
	Zap,
	Box,
	MessageSquare,
	Clock
} from 'lucide-react';

const HomePage = () => {
	const navigate = useNavigate();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
			setMobileMenuOpen(false);
		}
	};

	return (
		<div className="min-h-screen bg-white font-sans text-gray-900">
			{/* --- HEADER FIXO --- */}
			<header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
							<Building2 className="w-7 h-7 text-indigo-600" />
							<span className="text-xl font-bold text-gray-900">GestorIT</span>
						</div>

						{/* Desktop Nav */}
						<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
							<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 transition-colors">Home</button>
							<button onClick={() => scrollToSection('recursos')} className="hover:text-indigo-600 transition-colors">Recursos</button>
							<button onClick={() => scrollToSection('planos')} className="hover:text-indigo-600 transition-colors">Planos</button>
							<button onClick={() => scrollToSection('sobre')} className="hover:text-indigo-600 transition-colors">Sobre</button>
						</nav>

						{/* Desktop Actions */}
						<div className="hidden md:flex items-center gap-4">
							<button
								onClick={() => navigate('/login')}
								className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
							>
								Login
							</button>
							<button
								onClick={() => navigate('/login')} // No futuro, pode ir para uma rota de registro
								className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
							>
								Criar Conta
							</button>
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
								{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu Dropdown */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
						<button onClick={() => scrollToSection('recursos')} className="block w-full text-left py-2 font-medium text-gray-600">Recursos</button>
						<button onClick={() => scrollToSection('planos')} className="block w-full text-left py-2 font-medium text-gray-600">Planos</button>
						<div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
							<button onClick={() => navigate('/login')} className="w-full py-2 text-center text-gray-600 font-medium border border-gray-200 rounded-md">Login</button>
							<button onClick={() => navigate('/login')} className="w-full py-2 text-center bg-indigo-600 text-white font-medium rounded-md">Criar Conta</button>
						</div>
					</div>
				)}
			</header>

			{/* --- HERO SECTION --- */}
			<section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 via-white to-white">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
						A plataforma da sua empresa de suporte para dominar <span className="text-indigo-600">clientes, chamados e equipamentos.</span>
					</h1>
					<p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
						Transforme a forma como sua prestadora de serviços de TI gerencia contratos, técnicos e inventário. Rápido, intuitivo e feito para crescer com você.
					</p>
					
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
						<button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 flex items-center justify-center gap-2">
							Criar conta teste gratuita <ArrowRight size={18} />
						</button>
						<button onClick={() => scrollToSection('video')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 text-base font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
							<Play size={18} className="fill-gray-700" /> Ver demonstração
						</button>
					</div>

					{/* Video Placeholder */}
					<div id="video" className="relative w-full aspect-video max-w-4xl mx-auto bg-slate-900 rounded-2xl shadow-2xl overflow-hidden group cursor-pointer border-4 border-white">
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-all">
							<div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
								<Play size={32} className="text-white fill-white ml-1" />
							</div>
						</div>
						<img 
							src="/images/hero-dashboard.png" 
							alt="Dashboard Preview" 
							className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
						/>
						<div className="absolute bottom-6 left-6 text-white text-left">
							<div className="text-sm font-medium text-indigo-300 mb-1">Vídeo de Apresentação</div>
							<div className="text-xl font-bold">Veja como funciona em menos de 60 segundos</div>
						</div>
					</div>
				</div>
			</section>

			{/* --- PROBLEM / SOLUTION --- */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<div className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full mb-3">O Problema</div>
						<h2 className="text-3xl font-bold text-gray-900">Por que o GestorIT existe?</h2>
						<p className="mt-4 text-gray-600 max-w-2xl mx-auto">Empresas de suporte perdem produtividade todos os dias tentando gerenciar o caos com ferramentas desconectadas.</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<div className="flex gap-4 items-start p-4 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
								<div className="bg-red-100 p-2 rounded-md shrink-0">
									<MessageSquare className="text-red-600 w-6 h-6" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Chamados perdidos no WhatsApp</h3>
									<p className="text-sm text-gray-600 mt-1">Mensagens esquecidas, falta de histórico e cliente cobrando respostas.</p>
								</div>
							</div>
							<div className="flex gap-4 items-start p-4 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
								<div className="bg-red-100 p-2 rounded-md shrink-0">
									<Box className="text-red-600 w-6 h-6" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Equipamentos sem rastreio</h3>
									<p className="text-sm text-gray-600 mt-1">Onde está aquele notebook? Qual a configuração? Quando vence a garantia?</p>
								</div>
							</div>
							<div className="flex gap-4 items-start p-4 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
								<div className="bg-red-100 p-2 rounded-md shrink-0">
									<Clock className="text-red-600 w-6 h-6" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">SLA e produtividade invisíveis</h3>
									<p className="text-sm text-gray-600 mt-1">Sem métricas para cobrar técnicos ou justificar contratos para clientes.</p>
								</div>
							</div>
						</div>

						<div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
							<div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
							<div className="relative z-10">
								<h3 className="text-2xl font-bold mb-6">A solução GestorIT</h3>
								<ul className="space-y-4">
									<li className="flex items-center gap-3">
										<CheckCircle2 className="text-emerald-400 w-6 h-6" />
										<span className="text-indigo-100">Centralização total de chamados</span>
									</li>
									<li className="flex items-center gap-3">
										<CheckCircle2 className="text-emerald-400 w-6 h-6" />
										<span className="text-indigo-100">Inventário vinculado a manutenções</span>
									</li>
									<li className="flex items-center gap-3">
										<CheckCircle2 className="text-emerald-400 w-6 h-6" />
										<span className="text-indigo-100">Dashboards automáticos de SLA</span>
									</li>
									<li className="flex items-center gap-3">
										<CheckCircle2 className="text-emerald-400 w-6 h-6" />
										<span className="text-indigo-100">Ambiente exclusivo para cada cliente</span>
									</li>
								</ul>
								<div className="mt-8 pt-8 border-t border-indigo-700/50">
									<p className="font-medium text-indigo-200 italic">"Finalmente conseguimos organizar a casa e escalar nossa operação sem contratar mais gente."</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* --- HOW IT WORKS --- */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900">Como funciona</h2>
						<p className="mt-4 text-gray-600">Simples em 4 passos.</p>
					</div>

					<div className="grid md:grid-cols-4 gap-8">
						{[
							{ icon: Building2, title: '1. Cadastre', desc: 'Configure sua equipe, permissões, clientes e filiais em minutos.' },
							{ icon: Monitor, title: '2. Centralize', desc: 'Cadastre equipamentos com histórico, status e localização.' },
							{ icon: Wrench, title: '3. Gerencie', desc: 'Controle chamados com Kanban, prioridades e timeline.' },
							{ icon: BarChart3, title: '4. Acompanhe', desc: 'Visualize SLA, produtividade e custos em tempo real.' }
						].map((step, idx) => (
							<div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
								<div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
									{idx + 1}
								</div>
								<div className="mt-4 mb-4 text-indigo-600">
									<step.icon size={32} />
								</div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
								<p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* --- RECURSOS --- */}
			<section id="recursos" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900">Tudo o que sua operação precisa</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{/* Card 1 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<LayoutDashboard className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Kanban Avançado</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Drag & Drop intuitivo</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Prazos e SLA visuais</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Anexos e tags coloridas</li>
							</ul>
						</div>

						{/* Card 2 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<Monitor className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Ativos</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Histórico completo</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Transferência entre filiais</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Upload de fotos e NF</li>
							</ul>
						</div>

						{/* Card 3 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<Users className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Portal do Cliente</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Ambiente isolado (White-label)</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Abertura fácil de tickets</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Acompanhamento em tempo real</li>
							</ul>
						</div>

						{/* Card 4 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<ShieldCheck className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Permissões Granulares</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Perfis de Técnico, Gestor e Admin</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Controle de acesso por cliente</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Segurança auditável</li>
							</ul>
						</div>

						{/* Card 5 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<BarChart3 className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">BI e Métricas</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Tempo médio de atendimento</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Produtividade por técnico</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Clientes mais demandantes</li>
							</ul>
						</div>

						{/* Card 6 */}
						<div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl transition-all group">
							<div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<Smartphone className="text-indigo-600 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Ready</h3>
							<ul className="space-y-2 text-gray-600 text-sm">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> App responsivo</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Fotos direto da câmera</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Ideal para técnicos de campo</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* --- PLANOS --- */}
			<section id="planos" className="py-20 bg-slate-900 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">Escolha o plano ideal</h2>
						<p className="text-slate-400">Transparente, sem custos ocultos.</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{/* Starter */}
						<div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-500 transition-colors">
							<h3 className="text-xl font-semibold text-white">Starter</h3>
							<p className="text-sm text-slate-400 mt-2 h-10">Para pequenas operações e consultores independentes.</p>
							<div className="my-6">
								<span className="text-4xl font-bold">R$ 197</span>
								<span className="text-slate-500">/mês</span>
							</div>
							<button onClick={() => navigate('/login')} className="w-full py-3 rounded-lg border border-slate-600 hover:bg-slate-700 text-white font-medium transition-colors mb-8">
								Começar Grátis
							</button>
							<ul className="space-y-3 text-sm text-slate-300">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Até 2 técnicos</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Até 50 equipamentos</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Chamados ilimitados</li>
							</ul>
						</div>

						{/* Pro - Destaque */}
						<div className="bg-indigo-600 rounded-2xl p-8 border border-indigo-500 shadow-2xl relative transform md:-translate-y-4">
							<div className="absolute top-0 right-0 left-0 -mt-3 text-center">
								<span className="bg-amber-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mais Popular</span>
							</div>
							<h3 className="text-xl font-semibold text-white">Pro</h3>
							<p className="text-sm text-indigo-200 mt-2 h-10">Para equipes estruturadas com múltiplos clientes.</p>
							<div className="my-6">
								<span className="text-4xl font-bold">R$ 397</span>
								<span className="text-indigo-200">/mês</span>
							</div>
							<button onClick={() => navigate('/login')} className="w-full py-3 rounded-lg bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-colors mb-8">
								Começar Grátis
							</button>
							<ul className="space-y-3 text-sm text-white">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Até 10 técnicos</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Equipamentos ilimitados</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Portal do Cliente Personalizado</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Relatórios Avançados</li>
							</ul>
						</div>

						{/* Enterprise */}
						<div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-500 transition-colors">
							<h3 className="text-xl font-semibold text-white">Enterprise</h3>
							<p className="text-sm text-slate-400 mt-2 h-10">Soluções customizadas com integrações completas.</p>
							<div className="my-6">
								<span className="text-2xl font-bold">Sob Consulta</span>
							</div>
							<button className="w-full py-3 rounded-lg border border-slate-600 hover:bg-slate-700 text-white font-medium transition-colors mb-8">
								Falar com Vendas
							</button>
							<ul className="space-y-3 text-sm text-slate-300">
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Técnicos ilimitados</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> API Dedicada</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Gerente de Sucesso</li>
								<li className="flex gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Customizações de BI</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* --- CTA FINAL --- */}
			<section className="py-24 bg-white text-center px-4">
				<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Transforme sua operação de suporte.<br/>Deixe a bagunça para trás.</h2>
				<p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">Profissionalize sua gestão, aumente a produtividade e melhore a experiência do seu cliente hoje mesmo.</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<button onClick={() => navigate('/login')} className="px-8 py-4 rounded-full bg-indigo-600 text-white text-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1">
						Criar conta gratuita
					</button>
					<button onClick={() => navigate('/login')} className="px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 text-lg font-semibold hover:bg-gray-50 transition-all">
						Falar com especialista
					</button>
				</div>
			</section>

			{/* --- FOOTER --- */}
			<footer id="sobre" className="bg-gray-50 pt-16 pb-8 border-t border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div className="col-span-1 md:col-span-1">
							<div className="flex items-center gap-2 mb-4">
								<Building2 className="w-6 h-6 text-indigo-600" />
								<span className="text-lg font-bold text-gray-900">GestorIT</span>
							</div>
							<p className="text-sm text-gray-500">
								A plataforma definitiva para empresas de suporte técnico e MSPs.
							</p>
						</div>
						
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Produto</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li><a href="#" className="hover:text-indigo-600">Recursos</a></li>
								<li><a href="#" className="hover:text-indigo-600">Planos</a></li>
								<li><a href="#" className="hover:text-indigo-600">App Mobile</a></li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Empresa</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li><a href="#" className="hover:text-indigo-600">Sobre nós</a></li>
								<li><a href="#" className="hover:text-indigo-600">Contato</a></li>
								<li><a href="#" className="hover:text-indigo-600">Trabalhe conosco</a></li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li><a href="#" className="hover:text-indigo-600">Termos de uso</a></li>
								<li><a href="#" className="hover:text-indigo-600">Privacidade</a></li>
							</ul>
						</div>
					</div>
					
					<div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
						&copy; {new Date().getFullYear()} GestorIT. Todos os direitos reservados.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
