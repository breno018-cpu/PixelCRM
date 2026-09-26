// frontend/src/components/chat/ChatContainer.jsx
// Contêiner Principal da Área de Conversa (PROMPT 04 - ETAPA 05)
// Alternância transparente entre Estado Vazio e Conversa Ativa

import React from 'react';
import { Award, ShieldCheck, MessageSquare } from 'lucide-react';
import ChatHeader from './ChatHeader';

const EmptyStateLogo = ({ size = 64 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-80"
  >
    <defs>
      <linearGradient id="emptyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00a884" />
        <stop offset="100%" stopColor="#53bdeb" />
      </linearGradient>
    </defs>
    <rect x="26" y="15" width="8" height="70" rx="4" fill="url(#emptyLogoGrad)" />
    <rect x="46" y="15" width="8" height="70" rx="4" fill="url(#emptyLogoGrad)" />
    <rect x="66" y="15" width="8" height="70" rx="4" fill="url(#emptyLogoGrad)" />
    <rect x="15" y="26" width="70" height="8" rx="4" fill="url(#emptyLogoGrad)" opacity="0.8" />
    <rect x="15" y="46" width="70" height="8" rx="4" fill="url(#emptyLogoGrad)" />
    <rect x="15" y="66" width="70" height="8" rx="4" fill="url(#emptyLogoGrad)" opacity="0.8" />
    <rect x="44" y="44" width="12" height="12" rx="3" fill="#ffffff" stroke="#00a884" strokeWidth="2" />
  </svg>
);

export default function ChatContainer({
  activeChat = null,
  onBack,
  onToggleCrm,
  isCrmOpen = false,
  onToggleSearch,
  isSearchOpen = false,
  onToggleCopilot,
  isCopilotOpen = false,
  onArchiveChat,
  syncProgress = null,
  stats = { leads: 0, negotiating: 0, proposal: 0, closed: 0 },
  children
}) {
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--chat-bg)] relative select-none h-full">
        <div className="max-w-md space-y-6 flex flex-col items-center">
          
          <div className="p-5 rounded-full bg-[var(--sidebar-bg)] border border-[var(--border-light)] shadow-sm">
            <EmptyStateLogo size={64} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-light text-[var(--text-primary)]">
              PixelCRM Shineray
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Selecione um cliente na lista à esquerda para responder mensagens, qualificar leads no funil e registrar anotações comerciais.
            </p>
          </div>

          {/* Mini Resumo do Funil Comercial */}
          <div className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-light)] p-3.5 rounded-2xl text-left shadow-xs space-y-2.5">
            <p className="text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase flex items-center gap-1.5 border-b border-[var(--border-light)] pb-2">
              <Award size={13} className="text-[#00a884]" />
              <span>Pipeline Comercial</span>
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[var(--header-bg)] py-1.5 px-1 rounded-xl">
                <p className="text-xs font-bold text-[#0284c7]">{stats.leads || 0}</p>
                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Leads</p>
              </div>
              <div className="bg-[var(--header-bg)] py-1.5 px-1 rounded-xl">
                <p className="text-xs font-bold text-[#d97706]">{stats.negotiating || 0}</p>
                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Negoc.</p>
              </div>
              <div className="bg-[var(--header-bg)] py-1.5 px-1 rounded-xl">
                <p className="text-xs font-bold text-[#7c3aed]">{stats.proposal || 0}</p>
                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Prop.</p>
              </div>
              <div className="bg-[var(--header-bg)] py-1.5 px-1 rounded-xl">
                <p className="text-xs font-bold text-[#00a884]">{stats.closed || 0}</p>
                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Fech.</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 border-t border-[var(--border-light)] pt-4 w-full justify-center">
            <ShieldCheck size={14} className="text-[#00a884]" />
            <span>Sessão segura criptografada via Baileys Engine</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--chat-bg)] overflow-hidden relative">
      
      {/* 1. HEADER DA CONVERSA */}
      <ChatHeader
        activeChat={activeChat}
        onBack={onBack}
        onToggleCrm={onToggleCrm}
        isCrmOpen={isCrmOpen}
        onToggleSearch={onToggleSearch}
        isSearchOpen={isSearchOpen}
        onToggleCopilot={onToggleCopilot}
        isCopilotOpen={isCopilotOpen}
        onArchiveChat={onArchiveChat}
        syncProgress={syncProgress}
      />

      {/* 2. ÁREA DE MENSAGENS, COPILOTO E COMPOSITOR */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>

    </div>
  );
}
