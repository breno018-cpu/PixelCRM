import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Store, 
  ShieldCheck, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

/**
 * AssignmentSelector
 * Gerencia a atribuição de Filial Shineray e Consultor de Vendas do Chat ativo.
 */
export default function AssignmentSelector({
  activeChat,
  stores = [],
  users = [],
  onAssignChat,
  disabled = false
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!activeChat) return null;

  const currentStoreId = activeChat.storeId || '';
  const currentUserId = activeChat.assignedUserId || '';

  const handleStoreChange = async (e) => {
    const newStoreId = e.target.value || null;
    if (newStoreId === currentStoreId) return;

    try {
      setIsUpdating(true);
      if (onAssignChat) {
        await onAssignChat(activeChat.id, {
          storeId: newStoreId,
          assignedUserId: activeChat.assignedUserId
        });
        showFeedback();
      }
    } catch (err) {
      console.error('[AssignmentSelector] Erro ao atribuir filial:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUserChange = async (e) => {
    const newUserId = e.target.value || null;
    if (newUserId === currentUserId) return;

    try {
      setIsUpdating(true);
      if (onAssignChat) {
        await onAssignChat(activeChat.id, {
          storeId: activeChat.storeId,
          assignedUserId: newUserId
        });
        showFeedback();
      }
    } catch (err) {
      console.error('[AssignmentSelector] Erro ao atribuir vendedor:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const showFeedback = () => {
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="w-full space-y-4 bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-2xl p-4 shadow-xs transition-colors">
      
      {/* Cabeçalho do Seletor */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
          Atribuições Comerciais
        </span>

        {isUpdating ? (
          <span className="text-[10px] text-[var(--brand-primary,#00a884)] font-semibold flex items-center gap-1">
            <Loader2 size={11} className="animate-spin" />
            Salvando...
          </span>
        ) : successMsg ? (
          <span className="text-[10px] text-[var(--brand-primary,#00a884)] font-bold flex items-center gap-1 animate-fade-in">
            <Check size={12} />
            Atualizado!
          </span>
        ) : null}
      </div>

      {/* 1. SELEÇÃO DE FILIAL */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--text-primary,#111b21)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Store size={14} className="text-[var(--brand-primary,#00a884)]" />
            <span>Filial / Concessionária</span>
          </span>
          {stores.length > 0 && (
            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
              {stores.length} {stores.length === 1 ? 'loja' : 'lojas'}
            </span>
          )}
        </label>

        <select
          value={currentStoreId}
          onChange={handleStoreChange}
          disabled={disabled || isUpdating}
          className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary,#111b21)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] cursor-pointer disabled:opacity-60 transition-colors"
        >
          <option value="">Sem Filial Atribuída (Geral)</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.city ? `(${s.city})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* 2. SELEÇÃO DE VENDEDOR / ATENDENTE */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--text-primary,#111b21)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-[var(--brand-primary,#00a884)]" />
            <span>Consultor de Vendas</span>
          </span>
          {users.length > 0 && (
            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
              {users.length} {users.length === 1 ? 'operador' : 'operadores'}
            </span>
          )}
        </label>

        <select
          value={currentUserId}
          onChange={handleUserChange}
          disabled={disabled || isUpdating}
          className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary,#111b21)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] cursor-pointer disabled:opacity-60 transition-colors"
        >
          <option value="">Não Atribuído (Fila Aberta)</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email} {u.role === 'ADMIN' ? '👑 Admin' : '👤 Consultor'}
            </option>
          ))}
        </select>
      </div>

      {/* Informação sobre permissão e regras */}
      <div className="pt-1 flex items-center gap-1.5 text-[10px] text-[var(--text-secondary,#667781)]">
        <ShieldCheck size={12} className="text-[var(--brand-primary,#00a884)] shrink-0" />
        <span>Atribuições refletem instantaneamente no Kanban e nas métricas de conversão.</span>
      </div>

    </div>
  );
}
