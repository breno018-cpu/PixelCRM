// frontend/src/components/conversations/ConversationList.jsx
// Coluna e Lista Completa de Conversas (PROMPT 04 - ETAPA 04)

import React, { useState, useMemo } from 'react';
import { Archive, ArrowLeft, MessageSquare, ShieldAlert, QrCode } from 'lucide-react';
import ConversationSearch from './ConversationSearch';
import FilterChips from './FilterChips';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  chats = [],
  activeChat = null,
  selectChat,
  searchQuery = '',
  setSearchQuery,
  filterFunnelStage = '',
  setFilterFunnelStage,
  filterStoreId = '',
  setFilterStoreId,
  filterUserId = '',
  setFilterUserId,
  stores = [],
  users = [],
  archivedView = false,
  setArchivedView,
  archiveChat,
  loadingChats = false,
  syncProgresses = {},
  whatsappStatus = 'connected',
  onGoToConnect
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Filtragem local complementar com alta responsividade
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // 1. Visão Arquivadas vs Ativas
      if (archivedView) {
        if (!chat.isArchived) return false;
      } else {
        if (chat.isArchived) return false;
      }

      // 2. Filtro Apenas Não Lidas
      if (filterUnreadOnly && (!chat.unreadCount || chat.unreadCount <= 0)) {
        return false;
      }

      // 3. Filtro por Estágio do Funil
      if (filterFunnelStage && chat.funnelStage !== filterFunnelStage) {
        return false;
      }

      // 4. Filtro por Filial
      if (filterStoreId && chat.storeId !== filterStoreId) {
        return false;
      }

      // 5. Filtro por Atendente
      if (filterUserId && chat.assignedUserId !== filterUserId) {
        return false;
      }

      // 6. Filtro por Texto da Busca (se não processado pela API)
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = chat.name?.toLowerCase().includes(query);
        const phoneMatch = chat.phone?.includes(query);
        const pushNameMatch = chat.pushName?.toLowerCase().includes(query);
        const lastMsgMatch = chat.lastMessage?.text?.toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !pushNameMatch && !lastMsgMatch) {
          return false;
        }
      }

      return true;
    });
  }, [chats, archivedView, filterUnreadOnly, filterFunnelStage, filterStoreId, filterUserId, searchQuery]);

  const hasActiveFilters = Boolean(filterFunnelStage || filterStoreId || filterUserId || filterUnreadOnly);

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] overflow-hidden select-none">
      
      {/* 1. HEADER DA LISTA DE CONVERSAS */}
      <div className="h-[60px] bg-[var(--header-bg)] px-4 flex items-center justify-between border-b border-[var(--border-light)] shrink-0">
        <div className="flex items-center gap-2">
          {archivedView && (
            <button
              onClick={() => setArchivedView(false)}
              className="p-1 hover:bg-[var(--active-bg)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Voltar para conversas ativas"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>{archivedView ? 'Conversas Arquivadas' : 'Conversas'}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--active-bg)] text-[var(--text-secondary)] font-semibold">
              {filteredChats.length}
            </span>
          </h2>
        </div>

        {/* Status de Conexão WhatsApp */}
        {whatsappStatus !== 'connected' && onGoToConnect && (
          <button
            onClick={onGoToConnect}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold hover:bg-amber-500/20 transition-all animate-pulse"
            title="Clique para escanear o QR Code e reconectar o WhatsApp"
          >
            <QrCode size={13} />
            <span>Reconectar</span>
          </button>
        )}
      </div>

      {/* 2. BARRA DE BUSCA */}
      <ConversationSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loadingChats}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. PÍLULAS DE FILTRO */}
      <FilterChips
        filterFunnelStage={filterFunnelStage}
        setFilterFunnelStage={setFilterFunnelStage}
        filterUnreadOnly={filterUnreadOnly}
        setFilterUnreadOnly={setFilterUnreadOnly}
        filterStoreId={filterStoreId}
        setFilterStoreId={setFilterStoreId}
        filterUserId={filterUserId}
        setFilterUserId={setFilterUserId}
        stores={stores}
        users={users}
        showExtended={showFilters}
        onResetFilters={() => {
          setFilterFunnelStage('');
          setFilterUnreadOnly(false);
          setFilterStoreId('');
          setFilterUserId('');
        }}
      />

      {/* 4. LISTA ROLÁVEL DE CONVERSAS */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-light)]/40">
        {loadingChats && chats.length === 0 ? (
          // Skeleton Loading
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-[var(--border-light)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[var(--border-light)] rounded w-2/3" />
                  <div className="h-2.5 bg-[var(--border-light)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          // Estado Vazio
          <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center text-[var(--text-muted)]">
            <div className="w-12 h-12 rounded-full bg-[var(--header-bg)] flex items-center justify-center">
              <MessageSquare size={24} className="text-[var(--text-secondary)] opacity-60" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {searchQuery || hasActiveFilters
                  ? 'Nenhuma conversa encontrada'
                  : archivedView
                  ? 'Nenhuma conversa arquivada'
                  : 'Nenhuma conversa no momento'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                {searchQuery || hasActiveFilters
                  ? 'Tente ajustar os termos de pesquisa ou remover os filtros aplicados.'
                  : 'As mensagens recebidas no WhatsApp aparecerão aqui instantaneamente.'}
              </p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isSelected={activeChat?.id === chat.id}
              onSelect={() => selectChat(chat.id)}
              onArchive={archiveChat}
              isArchivedView={archivedView}
              syncProgress={syncProgresses[chat.id]}
            />
          ))
        )}
      </div>

    </div>
  );
}
