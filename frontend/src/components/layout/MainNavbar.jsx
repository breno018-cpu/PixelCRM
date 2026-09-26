// frontend/src/components/layout/MainNavbar.jsx
// Barra de Navegação Lateral Ultra-Compacta (PROMPT 04 - ETAPA 03)
// Ergonomia fiel ao WhatsApp Web com identidade comercial Shineray

import React from 'react';
import { 
  MessageSquare, Kanban, BarChart3, Bot, Sparkles, 
  Archive, Sun, Moon, Building2, HelpCircle, 
  LogOut, ShieldAlert, User
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

// Logomarca Compacta da PixelLoom / Shineray
const NavbarLogo = ({ size = 26 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 transition-transform hover:scale-105"
  >
    <defs>
      <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00a884" />
        <stop offset="100%" stopColor="#53bdeb" />
      </linearGradient>
    </defs>
    <rect x="26" y="15" width="8" height="70" rx="4" fill="url(#navLogoGrad)" />
    <rect x="46" y="15" width="8" height="70" rx="4" fill="url(#navLogoGrad)" />
    <rect x="66" y="15" width="8" height="70" rx="4" fill="url(#navLogoGrad)" />
    <rect x="15" y="26" width="70" height="8" rx="4" fill="url(#navLogoGrad)" opacity="0.85" />
    <rect x="15" y="46" width="70" height="8" rx="4" fill="url(#navLogoGrad)" />
    <rect x="15" y="66" width="70" height="8" rx="4" fill="url(#navLogoGrad)" opacity="0.85" />
    <rect x="44" y="44" width="12" height="12" rx="3" fill="#ffffff" stroke="#00a884" strokeWidth="2.5" />
  </svg>
);

export default function MainNavbar({
  activeTab = 'chats',
  setActiveTab,
  archivedView = false,
  setArchivedView,
  hasUnread = false,
  hasActiveAutomations = false,
  hasActiveAi = false,
  isDarkMode: propIsDarkMode,
  onToggleDarkMode: propOnToggleDarkMode,
  currentUser,
  onOpenStoreModal,
  onOpenTutorialModal,
  onOpenAiModal,
  onOpenDisconnectModal,
  onLogout
}) {
  let crmCtx = null;
  try {
    crmCtx = useCRM();
  } catch (e) {
    // Caso usado isoladamente fora do Provider
  }

  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : (crmCtx?.isDarkMode ?? false);
  const onToggleDarkMode = propOnToggleDarkMode || crmCtx?.toggleDarkMode;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <nav className="w-full h-full flex flex-col justify-between items-center py-3 select-none text-[var(--text-secondary)]">
      
      {/* 1. TOPO: LOGOMARCA & MÓDULOS PRINCIPAIS */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Logo */}
        <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--active-bg)] transition-colors cursor-pointer" title="PixelCRM Shineray">
          <NavbarLogo size={26} />
        </div>

        <div className="w-8 h-[1px] bg-[var(--border-light)] my-0.5" />

        {/* Grupo de Módulos */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          
          {/* Conversas Ativas */}
          <button
            onClick={() => {
              if (setArchivedView) setArchivedView(false);
              if (setActiveTab) setActiveTab('chats');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${
              activeTab === 'chats' && !archivedView
                ? 'bg-[var(--active-bg)] text-[#00a884]'
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Conversas"
            aria-label="Conversas Ativas"
          >
            <MessageSquare size={20} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[var(--header-bg)]" />
            )}
          </button>

          {/* Pipeline Comercial / Kanban */}
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('kanban');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              activeTab === 'kanban'
                ? 'bg-[var(--active-bg)] text-[#00a884]'
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Pipeline Comercial (Kanban)"
            aria-label="Pipeline Comercial"
          >
            <Kanban size={20} />
          </button>

          {/* Dashboard Analítico */}
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('dashboard');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              activeTab === 'dashboard'
                ? 'bg-[var(--active-bg)] text-[#00a884]'
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Dashboard & Métricas"
            aria-label="Dashboard"
          >
            <BarChart3 size={20} />
          </button>

          {/* Central de Automações */}
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('automations');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              activeTab === 'automations'
                ? 'bg-[var(--active-bg)] text-[#00a884]'
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Central de Automações"
            aria-label="Automações"
          >
            <Bot size={20} />
            {hasActiveAutomations && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[var(--header-bg)]" />
            )}
          </button>

          {/* Copiloto de IA */}
          <button
            onClick={onOpenAiModal}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative hover:bg-[var(--active-bg)] hover:text-purple-600"
            title="Configurações do Copiloto IA"
            aria-label="Copiloto IA"
          >
            <Sparkles size={20} className={hasActiveAi ? "text-purple-600" : ""} />
            {hasActiveAi && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-[var(--header-bg)]" />
            )}
          </button>

          {/* Conversas Arquivadas */}
          <button
            onClick={() => {
              if (setArchivedView) setArchivedView(true);
              if (setActiveTab) setActiveTab('chats');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              activeTab === 'chats' && archivedView
                ? 'bg-[var(--active-bg)] text-[#00a884]'
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Conversas Arquivadas"
            aria-label="Arquivadas"
          >
            <Archive size={20} />
          </button>

        </div>
      </div>

      {/* 2. BASE: UTILITÁRIOS, TEMA, GESTÃO & PERFIL */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        
        {/* Alternador de Tema Escuro / Claro */}
        <button
          onClick={onToggleDarkMode}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)] transition-colors"
          title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          aria-label="Alternar Tema"
        >
          {isDarkMode ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
        </button>

        {/* Gestão de Lojas e Equipe (Admin) */}
        {isAdmin && onOpenStoreModal && (
          <button
            onClick={onOpenStoreModal}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)] transition-colors"
            title="Gestão de Lojas e Atendentes"
            aria-label="Gestão Administrativa"
          >
            <Building2 size={19} />
          </button>
        )}

        {/* Guia Operacional Interativo */}
        {onOpenTutorialModal && (
          <button
            onClick={onOpenTutorialModal}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)] transition-colors"
            title="Guia de Operação do CRM"
            aria-label="Guia Operacional"
          >
            <HelpCircle size={19} />
          </button>
        )}

        <div className="w-8 h-[1px] bg-[var(--border-light)] my-0.5" />

        {/* Desconectar WhatsApp */}
        {onOpenDisconnectModal && (
          <button
            onClick={onOpenDisconnectModal}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            title="Desconectar Sessão do WhatsApp"
            aria-label="Desconectar WhatsApp"
          >
            <ShieldAlert size={19} />
          </button>
        )}

        {/* Avatar / Perfil do Operador */}
        <div 
          className="w-9 h-9 rounded-full bg-[#00a884]/15 text-[#00a884] font-bold text-xs flex items-center justify-center border border-[#00a884]/30 cursor-pointer shadow-xs my-0.5 hover:ring-2 hover:ring-[#00a884]/40 transition-all"
          title={`${currentUser?.name || 'Operador'} (${currentUser?.role === 'ADMIN' ? 'Administrador' : 'Atendente'})`}
        >
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
        </div>

        {/* Logout do Sistema */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            title="Sair do Sistema (Logout)"
            aria-label="Logout"
          >
            <LogOut size={19} />
          </button>
        )}

      </div>

    </nav>
  );
}
