// frontend/src/components/chat/MessageList.jsx
// Lista de Mensagens com Separadores de Data e Rolagem Inteligente (PROMPT 04 - ETAPA 06)

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { ChevronDown, Loader2, ArrowUp, Lock } from 'lucide-react';
import MessageBubble from './MessageBubble';

function getMessageDateGroup(timestamp) {
  if (!timestamp) return 'Antigas';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Antigas';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'HOJE';
  if (isYesterday) return 'ONTEM';

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function MessageList({
  messages = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  searchQuery = '',
  renderMedia = null,
  activeChatId
}) {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const previousScrollHeightRef = useRef(0);

  // Agrupa mensagens por data
  const groupedMessages = React.useMemo(() => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const groupName = getMessageDateGroup(msg.timestamp);
      if (!currentGroup || currentGroup.date !== groupName) {
        currentGroup = { date: groupName, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    });

    return groups;
  }, [messages]);

  // Monitora a posição de rolagem para exibir o botão de rolar para o final
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);

    // Carregamento infinito ao chegar no topo
    if (scrollTop === 0 && hasMore && !loadingMore && onLoadMore) {
      previousScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  // Preserva a posição de rolagem após carregar mensagens antigas sem "saltos"
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && previousScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // Rola para o final na abertura da conversa ou quando o usuário já está no final
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-label="Histórico de mensagens da conversa"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex-1 overflow-y-auto px-2 py-4 relative flex flex-col justify-start"
    >
      {/* 1. TOPO: CARREGADOR DE MENSAGENS ANTERIORES OU INÍCIO DA CONVERSA */}
      <div className="py-2 flex justify-center shrink-0">
        {loadingMore ? (
          <div 
            role="status"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--sidebar-bg)] border border-[var(--border-light)] text-xs text-[var(--text-secondary)] shadow-xs"
          >
            <Loader2 size={13} className="animate-spin text-[#00a884]" />
            <span>Carregando mensagens anteriores...</span>
          </div>
        ) : hasMore && onLoadMore ? (
          <button
            type="button"
            aria-label="Carregar mensagens anteriores desta conversa"
            onClick={() => {
              previousScrollHeightRef.current = containerRef.current?.scrollHeight || 0;
              onLoadMore();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--sidebar-bg)] hover:bg-[var(--active-bg)] border border-[var(--border-light)] text-[11px] font-semibold text-[var(--text-secondary)] shadow-xs transition-colors"
          >
            <ArrowUp size={12} />
            <span>Carregar mensagens anteriores</span>
          </button>
        ) : messages.length > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--sidebar-bg)]/80 border border-[var(--border-light)] text-[10.5px] text-[var(--text-muted)] select-none">
            <Lock size={11} className="text-[#00a884]" />
            <span>Início do histórico seguro desta conversa</span>
          </div>
        ) : null}
      </div>

      {/* 2. SKELETON LOADING INICIAL */}
      {loading && messages.length === 0 ? (
        <div className="space-y-4 p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
              <div className={`h-12 rounded-2xl bg-[var(--border-light)] ${i % 2 === 0 ? 'w-48' : 'w-56'}`} />
            </div>
          ))}
        </div>
      ) : null}

      {/* 3. MENSAGENS AGRUPADAS POR DATA */}
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx} className="w-full flex flex-col">
          
          {/* Separador de Data Centralizado */}
          <div className="flex justify-center my-3 sticky top-2 z-10 select-none">
            <span className="px-3 py-1 rounded-lg bg-[var(--header-bg)] border border-[var(--border-light)] text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider shadow-2xs">
              {group.date}
            </span>
          </div>

          {/* Balões de Mensagem */}
          {group.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              searchQuery={searchQuery}
              mediaComponent={renderMedia ? renderMedia(message) : null}
            />
          ))}

        </div>
      ))}

      {/* Âncora invisível de fim de mensagens */}
      <div ref={messagesEndRef} className="h-2 shrink-0" />

      {/* 4. BOTÃO FLUTUANTE DE ROLAR PARA O FINAL */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-20 right-8 z-30 p-2.5 rounded-full bg-[var(--sidebar-bg)] hover:bg-[var(--active-bg)] border border-[var(--border-light)] shadow-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all animate-bounce"
          title="Rolar para o final"
          aria-label="Ir para o final da conversa"
        >
          <ChevronDown size={18} />
        </button>
      )}

    </div>
  );
}
