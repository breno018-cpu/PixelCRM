// frontend/src/components/chat/ChatHeader.jsx
// Header da Conversa Ativa (PROMPT 04 - ETAPA 05)
// Ergonomia do WhatsApp Web com integração contextual de CRM

import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Sparkles, Tags, MoreVertical, 
  User, Archive, FolderOpen, Loader2, Building2 
} from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

export default function ChatHeader({
  activeChat,
  onBack,
  onToggleCrm,
  isCrmOpen = false,
  onToggleSearch,
  isSearchOpen = false,
  onToggleCopilot,
  isCopilotOpen = false,
  onArchiveChat,
  syncProgress = null
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (!activeChat) return null;

  const funnelStage = activeChat.funnelStage || 'LEAD';
  const funnelToken = TOKENS.colors.funnel[funnelStage] || TOKENS.colors.funnel.LEAD;

  return (
    <header className="h-[60px] bg-[var(--header-bg)] px-4 flex items-center justify-between border-b border-[var(--border-light)] shrink-0 z-20 select-none transition-colors">
      
      {/* 1. LADO ESQUERDO: BOTÃO VOLTAR (MOBILE) + AVATAR + DADOS DO CLIENTE */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Botão Voltar (Visível no Mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 hover:bg-[var(--active-bg)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div 
          onClick={onToggleCrm}
          className="relative shrink-0 cursor-pointer group"
          title="Ver ficha de CRM do contato"
        >
          {activeChat.avatarUrl ? (
            <img
              src={activeChat.avatarUrl}
              alt={activeChat.name || activeChat.phone}
              className="w-10 h-10 rounded-full object-cover border border-[var(--border-light)] group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className={`w-10 h-10 rounded-full bg-[var(--sidebar-bg)] text-[var(--text-secondary)] flex items-center justify-center font-bold text-sm border border-[var(--border-light)] ${activeChat.avatarUrl ? 'hidden' : 'flex'}`}
          >
            {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>

          <span 
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--header-bg)]"
            style={{ backgroundColor: funnelToken.color }}
          />
        </div>

        {/* Informações do Contato e Status do Funil */}
        <div 
          onClick={onToggleCrm}
          className="min-w-0 flex flex-col justify-center cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-[var(--text-primary)] truncate leading-tight">
              {activeChat.name || activeChat.phone}
            </h1>
            
            {activeChat.pushName && activeChat.name && (
              <span className="text-[11px] text-[var(--text-muted)] italic truncate hidden sm:inline">
                ({activeChat.pushName})
              </span>
            )}

            {/* Tag do Funil */}
            <span 
              className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
              style={{ 
                backgroundColor: funnelToken.bgLight, 
                color: funnelToken.color 
              }}
            >
              {funnelToken.label}
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2 mt-0.5 truncate">
            <span>{activeChat.phone}</span>
            {activeChat.store?.name && (
              <span className="text-[var(--text-muted)] flex items-center gap-0.5">
                • <Building2 size={10} className="inline" /> {activeChat.store.name}
              </span>
            )}
            {activeChat.assignedUser?.name && (
              <span className="text-[var(--text-muted)]">
                • {activeChat.assignedUser.name}
              </span>
            )}
          </p>
        </div>

      </div>

      {/* 2. LADO DIREITO: AÇÕES DO CHAT & CONTROLES CONTEXTUAIS */}
      <div className="flex items-center gap-1 text-[var(--text-secondary)] shrink-0">
        
        {/* Status de Sincronização */}
        {syncProgress && syncProgress.status !== 'completed' && (
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-[#00a884] font-semibold bg-[#00a884]/10 px-2.5 py-1 rounded-full mr-1">
            <Loader2 size={11} className="animate-spin" />
            <span>Sincronizando ({syncProgress.percent || 0}%)</span>
          </div>
        )}

        {/* Busca Interna na Conversa */}
        {onToggleSearch && (
          <button
            type="button"
            onClick={onToggleSearch}
            className={`p-2 rounded-full transition-colors ${
              isSearchOpen 
                ? 'bg-[var(--active-bg)] text-[#00a884]' 
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title="Pesquisar mensagens nesta conversa"
            aria-label="Buscar na conversa"
          >
            <Search size={18} />
          </button>
        )}

        {/* Copiloto de IA */}
        {onToggleCopilot && (
          <button
            type="button"
            onClick={onToggleCopilot}
            className={`p-2 rounded-full transition-colors ${
              isCopilotOpen 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-[var(--active-bg)] hover:text-purple-600 text-purple-600'
            }`}
            title="Copiloto Comercial IA"
            aria-label="Copiloto IA"
          >
            <Sparkles size={18} />
          </button>
        )}

        {/* Abrir / Fechar Painel Contextual de CRM */}
        {onToggleCrm && (
          <button
            type="button"
            onClick={onToggleCrm}
            className={`p-2 rounded-full transition-colors ${
              isCrmOpen 
                ? 'bg-[var(--active-bg)] text-[#00a884]' 
                : 'hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
            }`}
            title={isCrmOpen ? "Ocultar Ficha de CRM" : "Abrir Ficha de CRM"}
            aria-label="Ficha de CRM"
          >
            <Tags size={18} />
          </button>
        )}

        {/* Menu Contextual do Chat */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(prev => !prev)}
            className="p-2 rounded-full hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)] transition-colors"
            title="Mais opções da conversa"
            aria-label="Mais opções"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowMenu(false)} 
                aria-hidden="true" 
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--sidebar-bg)] border border-[var(--border-light)] rounded-xl shadow-xl py-1 z-40 animate-fade-in text-xs">
                
                {onToggleCrm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onToggleCrm();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[var(--active-bg)] text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <Tags size={14} className="text-[#00a884]" />
                    <span>Dados do Cliente / CRM</span>
                  </button>
                )}

                {onArchiveChat && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onArchiveChat(activeChat.id, !activeChat.isArchived);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[var(--active-bg)] text-[var(--text-primary)] flex items-center gap-2"
                  >
                    {activeChat.isArchived ? (
                      <>
                        <FolderOpen size={14} />
                        <span>Desarquivar conversa</span>
                      </>
                    ) : (
                      <>
                        <Archive size={14} />
                        <span>Arquivar conversa</span>
                      </>
                    )}
                  </button>
                )}

              </div>
            </>
          )}
        </div>

      </div>

    </header>
  );
}
