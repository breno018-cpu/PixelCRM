// frontend/src/components/conversations/ConversationItem.jsx
// Item Individual de Conversa na Lista (PROMPT 04 - ETAPA 04)
// Padrão de hierarquia visual e densidade ergonômica do WhatsApp Web

import React, { useState } from 'react';
import { 
  User, Check, CheckCheck, Archive, FolderOpen, 
  Mic, Image, FileText, Loader2, Building2 
} from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

function formatConversationTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Ontem';
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function ConversationItem({
  chat,
  isSelected = false,
  onSelect,
  onArchive,
  isArchivedView = false,
  syncProgress = null
}) {
  const [isHovered, setIsHovered] = useState(false);

  const lastMessage = chat.lastMessage;
  const timeFormatted = formatConversationTime(chat.lastMessageTime || chat.updatedAt);
  const unreadCount = Number(chat.unreadCount) || 0;

  // Badge do estágio do Funil
  const funnelStage = chat.funnelStage || 'LEAD';
  const funnelToken = TOKENS.colors.funnel[funnelStage] || TOKENS.colors.funnel.LEAD;

  // Pré-visualização da última mensagem
  const renderMessagePreview = () => {
    if (!lastMessage) {
      return <span className="italic text-[var(--text-muted)]">Sem mensagens ainda</span>;
    }

    if (lastMessage.mediaUrl) {
      if (lastMessage.text?.toLowerCase().includes('áudio') || lastMessage.mediaUrl.endsWith('.ogg') || lastMessage.mediaUrl.endsWith('.mp3')) {
        return (
          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
            <Mic size={13} className="text-[#00a884] shrink-0" />
            <span>Mensagem de voz</span>
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
          <Image size={13} className="text-[var(--text-muted)] shrink-0" />
          <span>{lastMessage.text || 'Foto'}</span>
        </span>
      );
    }

    return (
      <span className="truncate">
        {lastMessage.text || ''}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect && onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Conversa com ${chat.name || chat.phone}${unreadCount > 0 ? `, ${unreadCount} mensagens não lidas` : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors relative select-none border-b border-[var(--border-light)]/60 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:outline-none
        ${isSelected 
          ? 'bg-[var(--active-bg)]' 
          : 'hover:bg-[var(--hover-bg)] bg-[var(--sidebar-bg)]'
        }
      `}
    >
      {/* 1. AVATAR DO CONTATO */}
      <div className="relative shrink-0">
        {chat.avatarUrl ? (
          <img
            src={chat.avatarUrl}
            alt={chat.name || chat.phone}
            className="w-12 h-12 rounded-full object-cover border border-[var(--border-light)]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className={`w-12 h-12 rounded-full bg-[var(--header-bg)] text-[var(--text-secondary)] flex items-center justify-center font-bold text-sm border border-[var(--border-light)] ${chat.avatarUrl ? 'hidden' : 'flex'}`}
        >
          {chat.name ? chat.name.charAt(0).toUpperCase() : <User size={20} />}
        </div>

        {/* Indicador de Funil na borda do Avatar */}
        <span 
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--sidebar-bg)] shadow-2xs"
          style={{ backgroundColor: funnelToken.color }}
          title={`Funil: ${funnelToken.label}`}
        />
      </div>

      {/* 2. CONTEÚDO PRINCIPAL (NOME + METADATA + PREVIEW) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        
        {/* Linha 1: Nome do Contato e Horário */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`truncate text-[14px] text-[var(--text-primary)] ${unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
              {chat.name || chat.phone}
            </span>
            {chat.pushName && chat.name && (
              <span className="text-[11px] text-[var(--text-muted)] italic truncate hidden sm:inline">
                ({chat.pushName})
              </span>
            )}
          </div>

          <span className={`text-[11px] shrink-0 font-normal ${unreadCount > 0 ? 'text-[#00a884] font-semibold' : 'text-[var(--text-muted)]'}`}>
            {timeFormatted}
          </span>
        </div>

        {/* Linha 2: Última Mensagem e Badges */}
        <div className="flex items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-1 text-[var(--text-secondary)] truncate min-w-0">
            {/* Status de Envio da Mensagem do Atendente */}
            {lastMessage?.fromMe && (
              <span className="shrink-0">
                <CheckCheck size={14} className="text-[#53bdeb]" />
              </span>
            )}
            
            {renderMessagePreview()}
          </div>

          {/* Badges à Direita: Botão Arquivar ou Badge de Não Lidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Botão Rápido de Arquivar no Hover */}
            {isHovered && onArchive ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(chat.id, !isArchivedView);
                }}
                className="p-1 rounded-full hover:bg-[var(--header-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors animate-fade-in"
                title={isArchivedView ? "Desarquivar conversa" : "Arquivar conversa"}
              >
                {isArchivedView ? <FolderOpen size={15} /> : <Archive size={15} />}
              </button>
            ) : null}

            {/* Contador de Não Lidas */}
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#00a884] text-white text-[10px] font-bold min-w-4 text-center shadow-2xs">
                {unreadCount}
              </span>
            )}

          </div>

        </div>

        {/* Linha 3: Badges Contextuais (Filial / Atendente / Estágio) */}
        <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
          <span 
            className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
            style={{ 
              backgroundColor: funnelToken.bgLight, 
              color: funnelToken.color 
            }}
          >
            {funnelToken.label}
          </span>

          {chat.store?.name && (
            <span className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-0.5">
              <Building2 size={10} className="shrink-0" />
              <span>{chat.store.name}</span>
            </span>
          )}

          {chat.assignedUser?.name && (
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              • {chat.assignedUser.name}
            </span>
          )}
        </div>

      </div>

      {/* 3. BARRA DE PROGRESSO DE SINCRONIZAÇÃO (Se estiver sincronizando) */}
      {syncProgress && syncProgress.status !== 'completed' && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a884] animate-pulse" 
          style={{ width: `${syncProgress.percent || 0}%` }}
        />
      )}
    </div>
  );
}

export default React.memo(ConversationItem, (prevProps, nextProps) => {
  return (
    prevProps.chat.id === nextProps.chat.id &&
    prevProps.chat.updatedAt === nextProps.chat.updatedAt &&
    prevProps.chat.unreadCount === nextProps.chat.unreadCount &&
    prevProps.chat.lastMessageTime === nextProps.chat.lastMessageTime &&
    prevProps.chat.funnelStage === nextProps.chat.funnelStage &&
    prevProps.chat.name === nextProps.chat.name &&
    prevProps.chat.tags === nextProps.chat.tags &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isArchivedView === nextProps.isArchivedView &&
    prevProps.syncProgress?.percent === nextProps.syncProgress?.percent &&
    prevProps.syncProgress?.status === nextProps.syncProgress?.status
  );
});
