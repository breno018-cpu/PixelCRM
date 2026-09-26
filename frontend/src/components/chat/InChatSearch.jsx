// frontend/src/components/chat/InChatSearch.jsx
// Barra de Busca Interna no Chat com Contadores e Navegação (PROMPT 04 - ETAPA 09)

import React, { useRef, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function InChatSearch({
  query = '',
  setQuery,
  matchIndex = 0,
  totalMatches = 0,
  onNext,
  onPrev,
  onClose
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        if (onPrev) onPrev();
      } else {
        if (onNext) onNext();
      }
    } else if (e.key === 'Escape') {
      if (onClose) onClose();
    }
  };

  return (
    <div className="bg-[var(--sidebar-bg)] border-b border-[var(--border-light)] px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-20 shadow-xs animate-fade-in select-none">
      
      {/* Campo de Busca */}
      <div className="relative flex-1 flex items-center bg-[var(--header-bg)] rounded-xl px-3 py-1.5 border border-transparent focus-within:border-[#00a884]">
        <Search size={15} className="text-[var(--text-muted)] mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar mensagens nesta conversa..."
          className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-full"
            title="Limpar pesquisa"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Contadores e Botões de Navegação */}
      <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--text-secondary)]">
        {query ? (
          <span className="text-[11px] font-medium mr-1 text-[var(--text-muted)]">
            {totalMatches > 0 ? `${matchIndex + 1} de ${totalMatches}` : 'Sem resultados'}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onPrev}
          disabled={totalMatches <= 1}
          className="p-1.5 rounded-lg hover:bg-[var(--active-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
          title="Mensagem anterior (Shift+Enter)"
          aria-label="Mensagem anterior"
        >
          <ChevronUp size={16} />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={totalMatches <= 1}
          className="p-1.5 rounded-lg hover:bg-[var(--active-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
          title="Próxima mensagem (Enter)"
          aria-label="Próxima mensagem"
        >
          <ChevronDown size={16} />
        </button>

        <div className="w-[1px] h-4 bg-[var(--border-light)] mx-1" />

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--active-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Fechar pesquisa (Esc)"
          aria-label="Fechar busca"
        >
          <X size={16} />
        </button>
      </div>

    </div>
  );
}
