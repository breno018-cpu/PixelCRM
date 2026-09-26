// frontend/src/components/conversations/ConversationSearch.jsx
// Barra de Busca de Conversas (PROMPT 04 - ETAPA 04)

import React, { useState, useRef } from 'react';
import { Search, X, Filter, Loader2, ArrowLeft } from 'lucide-react';

export default function ConversationSearch({
  searchQuery = '',
  setSearchQuery,
  loading = false,
  showFilters = false,
  setShowFilters,
  hasActiveFilters = false
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="px-3 py-2 flex items-center gap-2 bg-[var(--sidebar-bg)] border-b border-[var(--border-light)] select-none">
      <div 
        className={`flex-1 flex items-center bg-[var(--header-bg)] rounded-lg px-3 py-1.5 transition-all border ${
          isFocused 
            ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20 shadow-xs' 
            : 'border-transparent'
        }`}
      >
        {isFocused || searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-[var(--brand-primary)] mr-2 shrink-0 hover:rotate-90 transition-transform"
            title="Limpar busca"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          <Search size={16} className="text-[var(--text-muted)] mr-2 shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Pesquisar ou começar uma nova conversa"
          className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal"
        />

        {loading ? (
          <Loader2 size={14} className="animate-spin text-[var(--brand-primary)] shrink-0 ml-1" />
        ) : searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-[var(--active-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 ml-1 transition-colors"
            title="Limpar texto"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {setShowFilters && (
        <button
          type="button"
          onClick={() => setShowFilters(prev => !prev)}
          className={`p-2 rounded-lg transition-colors relative shrink-0 ${
            showFilters || hasActiveFilters
              ? 'bg-[#00a884]/10 text-[#00a884]'
              : 'hover:bg-[var(--active-bg)] text-[var(--text-secondary)]'
          }`}
          title="Filtros de Atendimento"
          aria-label="Filtrar conversas"
        >
          <Filter size={17} />
          {hasActiveFilters && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884]" />
          )}
        </button>
      )}
    </div>
  );
}
