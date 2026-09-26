// frontend/src/components/conversations/FilterChips.jsx
// Pílulas e Filtros Contextuais de Conversas (PROMPT 04 - ETAPA 04)

import React from 'react';
import { X, Building2, User } from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

export default function FilterChips({
  filterFunnelStage = '',
  setFilterFunnelStage,
  filterUnreadOnly = false,
  setFilterUnreadOnly,
  filterStoreId = '',
  setFilterStoreId,
  filterUserId = '',
  setFilterUserId,
  stores = [],
  users = [],
  showExtended = false,
  onResetFilters
}) {
  const stages = [
    { key: '', label: 'Todas' },
    { key: 'LEAD', label: 'Leads' },
    { key: 'NEGOTIATION', label: 'Negociação' },
    { key: 'PROPOSAL', label: 'Proposta' },
    { key: 'CLOSED', label: 'Fechado' }
  ];

  return (
    <div className="bg-[var(--sidebar-bg)] border-b border-[var(--border-light)] px-3 py-2 space-y-2 select-none">
      
      {/* Pílulas de Estágio do Funil & Não Lidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        
        {/* Filtro Não Lidas */}
        {setFilterUnreadOnly && (
          <button
            type="button"
            onClick={() => setFilterUnreadOnly(prev => !prev)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 border ${
              filterUnreadOnly
                ? 'bg-[#00a884] text-white border-[#00a884] shadow-xs'
                : 'bg-[var(--header-bg)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-medium)]'
            }`}
          >
            Não Lidas
          </button>
        )}

        {/* Estágios Comerciais */}
        {stages.map((stage) => {
          const isSelected = (!filterUnreadOnly && filterFunnelStage === stage.key);
          const stageToken = stage.key ? TOKENS.colors.funnel[stage.key] : null;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => {
                if (setFilterUnreadOnly) setFilterUnreadOnly(false);
                setFilterFunnelStage(stage.key);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[var(--active-bg)] text-[#00a884] border-[#00a884] shadow-xs font-bold'
                  : 'bg-[var(--header-bg)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]'
              }`}
            >
              {stageToken && (
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: stageToken.color }} 
                />
              )}
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filtros Estendidos: Filial e Atendente (Quando ativados) */}
      {showExtended && (
        <div className="pt-2 border-t border-[var(--border-light)] grid grid-cols-2 gap-2 animate-fade-in">
          
          {/* Seletor de Filial */}
          <div className="flex items-center gap-1.5 bg-[var(--header-bg)] rounded-lg px-2.5 py-1.5 border border-transparent focus-within:border-[#00a884]">
            <Building2 size={13} className="text-[var(--text-muted)] shrink-0" />
            <select
              value={filterStoreId}
              onChange={(e) => setFilterStoreId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-[var(--text-primary)] font-medium outline-none border-none cursor-pointer"
            >
              <option value="">Todas Filiais</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Seletor de Atendente */}
          <div className="flex items-center gap-1.5 bg-[var(--header-bg)] rounded-lg px-2.5 py-1.5 border border-transparent focus-within:border-[#00a884]">
            <User size={13} className="text-[var(--text-muted)] shrink-0" />
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full bg-transparent text-[11px] text-[var(--text-primary)] font-medium outline-none border-none cursor-pointer"
            >
              <option value="">Todos Atendentes</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

        </div>
      )}

    </div>
  );
}
