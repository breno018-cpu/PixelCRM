import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Copy, 
  Check, 
  Edit2, 
  X, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

/**
 * CustomerProfile
 * Perfil do Cliente no CRM com suporte a edição rápida do nome,
 * cópia do telefone, badge de estágio e metadados reais da conversa.
 */
export default function CustomerProfile({
  activeChat,
  onUpdateName,
  isUpdatingName = false
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(activeChat?.name || '');
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    setNameValue(activeChat?.name || '');
    setIsEditingName(false);
  }, [activeChat?.id, activeChat?.name]);

  if (!activeChat) return null;

  const funnelStage = activeChat.funnelStage || 'LEAD';
  const funnelToken = TOKENS.colors.funnel[funnelStage] || TOKENS.colors.funnel.LEAD;

  const handleCopyPhone = () => {
    if (!activeChat.phone) return;
    navigator.clipboard.writeText(activeChat.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSaveName = async (e) => {
    if (e) e.preventDefault();
    if (!nameValue.trim() || nameValue === activeChat.name) {
      setIsEditingName(false);
      return;
    }
    if (onUpdateName) {
      await onUpdateName(activeChat.id, nameValue.trim());
    }
    setIsEditingName(false);
  };

  const displayName = activeChat.name || activeChat.pushName || activeChat.phone;

  // Formatação de data da última mensagem
  const formattedLastDate = activeChat.lastMessageAt 
    ? new Date(activeChat.lastMessageAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="w-full flex flex-col items-center text-center p-4 bg-[var(--active-bg,#f0f2f5)]/50 border border-[var(--border-subtle,#e9edef)] rounded-2xl shadow-xs transition-colors">
      
      {/* 1. FOTO DE AVATAR */}
      <div className="relative mb-3 select-none">
        {activeChat.avatarUrl ? (
          <img 
            src={activeChat.avatarUrl} 
            alt={displayName} 
            className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--brand-primary,#00a884)]/15 text-[var(--brand-primary,#00a884)] flex items-center justify-center text-2xl font-bold border-2 border-[var(--brand-primary,#00a884)]/30 shadow-sm">
            {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={32} />}
          </div>
        )}

        {/* Indicador de Status Online / WhatsApp */}
        <span 
          className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00a884] border-2 border-white dark:border-slate-900 shadow-xs" 
          title="WhatsApp Ativo"
        />
      </div>

      {/* 2. NOME DO LEAD (COM SUPORTE A EDIÇÃO RÁPIDA) */}
      <div className="w-full max-w-[280px] mb-1">
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-1 animate-fade-in">
            <input
              type="text"
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Nome do cliente..."
              className="w-full px-2.5 py-1 text-xs font-semibold bg-[var(--bg-panel,#ffffff)] border border-[var(--brand-primary,#00a884)] rounded-lg text-[var(--text-primary,#111b21)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isUpdatingName}
              className="p-1.5 rounded-lg bg-[var(--brand-primary,#00a884)] text-white hover:bg-[#008f6f] transition-colors"
              title="Salvar Nome"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setNameValue(activeChat.name || '');
                setIsEditingName(false);
              }}
              className="p-1.5 rounded-lg bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] hover:text-rose-500 transition-colors"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <div className="group flex items-center justify-center gap-1.5">
            <h4 className="text-sm font-bold text-[var(--text-primary,#111b21)] truncate" title={displayName}>
              {displayName}
            </h4>
            <button
              onClick={() => setIsEditingName(true)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[var(--text-secondary,#667781)] hover:text-[var(--brand-primary,#00a884)] hover:bg-[var(--active-bg,#f0f2f5)] transition-all"
              title="Editar nome do cliente"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}

        {/* Nome do WhatsApp original se diferente do editado */}
        {activeChat.pushName && activeChat.name && activeChat.pushName !== activeChat.name && (
          <p className="text-[10px] text-[var(--text-secondary,#667781)] truncate" title={`WhatsApp: ~${activeChat.pushName}`}>
            ~{activeChat.pushName}
          </p>
        )}
      </div>

      {/* 3. TELEFONE COM AÇÃO DE COPIAR E LIGAR */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary,#667781)] mt-1">
        <div className="flex items-center gap-1 font-medium">
          <Phone size={12} />
          <span>{activeChat.phone}</span>
        </div>

        <button
          onClick={handleCopyPhone}
          className="p-1 rounded-md hover:bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)] transition-colors"
          title="Copiar número de telefone"
        >
          {copiedPhone ? (
            <span className="text-[10px] text-[var(--brand-primary,#00a884)] font-bold flex items-center gap-0.5">
              <Check size={11} /> Copiado
            </span>
          ) : (
            <Copy size={11} />
          )}
        </button>
      </div>

      {/* 4. BADGE DE ESTÁGIO COMERCIAL */}
      <div 
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs border transition-colors"
        style={{ 
          backgroundColor: funnelToken.bg, 
          color: funnelToken.color, 
          borderColor: funnelToken.border 
        }}
      >
        <span 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: funnelToken.color }} 
        />
        <span>{funnelToken.label}</span>
      </div>

      {/* 5. METADADOS DO ATENDIMENTO */}
      <div className="w-full mt-4 pt-3 border-t border-[var(--border-subtle,#e9edef)] grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary,#667781)] text-left">
        <div>
          <span className="block opacity-75">Última Mensagem</span>
          <span className="font-semibold text-[var(--text-primary,#111b21)] truncate block">
            {formattedLastDate || 'Sem histórico'}
          </span>
        </div>

        <div>
          <span className="block opacity-75">Origem do Contato</span>
          <span className="font-semibold text-[var(--text-primary,#111b21)] flex items-center gap-1">
            <MessageCircle size={10} className="text-[#00a884]" />
            WhatsApp
          </span>
        </div>
      </div>

    </div>
  );
}
