import React, { useState } from 'react';
import { 
  X, 
  User, 
  Award, 
  Building, 
  UserCheck, 
  Tags, 
  FileText, 
  Save, 
  Loader2, 
  Plus, 
  Check, 
  ShieldCheck, 
  Clock,
  Sparkles,
  Phone,
  Store,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

/**
 * CRMPanel
 * Painel Contextual do CRM Shineray integrado à lateral direita do Chat.
 * Suporta abas ('overview', 'funnel', 'notes', 'tags'), transição suave,
 * tokens de design e compatibilidade total com dados reais.
 */
export default function CRMPanel({
  activeChat,
  onClose,
  onUpdateFunnelStage,
  onAssignChat,
  stores = [],
  users = [],
  onAddTag,
  onRemoveTag,
  onSaveNotes,
  isSavingNotes = false,
  notesSavedAlert = false,
  // Custom child slots para etapas 12, 13 e 14
  customerProfileSlot = null,
  assignmentSlot = null,
  funnelStepperSlot = null,
  tagsManagerSlot = null,
  notesSectionSlot = null,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'funnel' | 'notes' | 'tags'
  const [tagInput, setTagInput] = useState('');
  const [localNotes, setLocalNotes] = useState(activeChat?.notes || '');

  // Sincroniza notas quando o chat ativo muda
  React.useEffect(() => {
    setLocalNotes(activeChat?.notes || '');
  }, [activeChat?.id, activeChat?.notes]);

  if (!activeChat) {
    return (
      <aside className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary,#667781)] select-none bg-[var(--sidebar-bg,#ffffff)]">
        <User size={36} className="text-[var(--text-secondary,#667781)]/40 mb-2" />
        <p className="text-xs">Selecione uma conversa para visualizar os dados de CRM do cliente.</p>
      </aside>
    );
  }

  const funnelStage = activeChat.funnelStage || 'LEAD';
  const funnelToken = TOKENS.colors.funnel[funnelStage] || TOKENS.colors.funnel.LEAD;

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    if (!tagInput.trim() || !onAddTag) return;
    onAddTag(tagInput.trim());
    setTagInput('');
  };

  const handleSaveNotesClick = () => {
    if (onSaveNotes) {
      onSaveNotes(localNotes);
    }
  };

  // Sugestões rápidas de tags comerciais para a Shineray
  const quickTags = [
    'Lead Quente',
    'Scooter Elétrica',
    'Financiamento',
    'Test-Ride',
    'Consórcio',
    'Documentação'
  ];

  const currentTags = activeChat.tags 
    ? activeChat.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div 
      className="w-full h-full flex flex-col bg-[var(--sidebar-bg,#ffffff)] select-none transition-colors duration-200 overflow-hidden font-sans border-l border-[var(--border-subtle,#e9edef)] shadow-sm"
      role="region"
      aria-label="Painel Contextual do Cliente"
    >
      {/* 1. CABEÇALHO DO PAINEL */}
      <header className="h-[60px] px-4 bg-[var(--header-bg,#f0f2f5)] border-b border-[var(--border-subtle,#e9edef)] flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary,#00a884)]/10 text-[var(--brand-primary,#00a884)] flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary,#111b21)] truncate">
              Ficha do Cliente
            </h3>
            <span className="text-[10px] text-[var(--text-secondary,#667781)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: funnelToken.color }} />
              {funnelToken.label}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)] hover:bg-[var(--hover-bg,#eae6df)] transition-colors active:scale-95"
          title="Fechar Painel CRM (Esc)"
          aria-label="Fechar Painel"
        >
          <X size={17} />
        </button>
      </header>

      {/* 2. NAVEGAÇÃO INTERNA POR ABAS */}
      <nav className="flex items-center border-b border-[var(--border-subtle,#e9edef)] bg-[var(--bg-panel,#ffffff)] px-2 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[var(--brand-primary,#00a884)] text-[var(--brand-primary,#00a884)]'
              : 'border-transparent text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)]'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('funnel')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'funnel'
              ? 'border-[var(--brand-primary,#00a884)] text-[var(--brand-primary,#00a884)]'
              : 'border-transparent text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)]'
          }`}
        >
          <span>Funil</span>
          <span 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: funnelToken.color }} 
          />
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'notes'
              ? 'border-[var(--brand-primary,#00a884)] text-[var(--brand-primary,#00a884)]'
              : 'border-transparent text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)]'
          }`}
        >
          <span>Notas</span>
          {activeChat.notes && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary,#00a884)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'tags'
              ? 'border-[var(--brand-primary,#00a884)] text-[var(--brand-primary,#00a884)]'
              : 'border-transparent text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)]'
          }`}
        >
          <span>Tags</span>
          {currentTags.length > 0 && (
            <span className="text-[10px] px-1 rounded-full bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)]">
              {currentTags.length}
            </span>
          )}
        </button>
      </nav>

      {/* 3. CORPO DO PAINEL (SCROLLÁVEL) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* ABA 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fade-in">
            {/* Slot do Perfil do Cliente ou Perfil Padrão */}
            {customerProfileSlot ? customerProfileSlot : (
              <div className="flex flex-col items-center text-center p-4 bg-[var(--active-bg,#f0f2f5)]/50 border border-[var(--border-subtle,#e9edef)] rounded-xl">
                {activeChat.avatarUrl ? (
                  <img 
                    src={activeChat.avatarUrl} 
                    alt={activeChat.name || activeChat.phone} 
                    className="w-18 h-18 rounded-full object-cover shrink-0 select-none border-2 border-white dark:border-slate-800 shadow-md mb-2.5" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-full bg-[var(--brand-primary,#00a884)]/15 text-[var(--brand-primary,#00a884)] flex items-center justify-center text-2xl font-bold border border-[var(--brand-primary,#00a884)]/30 shadow-sm mb-2.5">
                    {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={28} />}
                  </div>
                )}
                
                <h4 className="text-sm font-bold text-[var(--text-primary,#111b21)]">
                  {activeChat.name || activeChat.pushName || activeChat.phone}
                </h4>
                
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary,#667781)] mt-0.5">
                  <Phone size={12} />
                  <span>{activeChat.phone}</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs"
                  style={{ backgroundColor: funnelToken.bg, color: funnelToken.color, borderColor: funnelToken.border }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: funnelToken.color }} />
                  <span>{funnelToken.label}</span>
                </div>
              </div>
            )}

            {/* Slot de Atribuições ou Seletor Padrão */}
            {assignmentSlot ? assignmentSlot : (
              <div className="space-y-3.5 bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
                  Responsáveis Comerciais
                </span>

                {/* Filial */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-primary,#111b21)] flex items-center gap-1.5">
                    <Store size={13} className="text-[var(--brand-primary,#00a884)]" />
                    <span>Filial Shineray</span>
                  </label>
                  <select
                    value={activeChat.storeId || ''}
                    onChange={async (e) => {
                      const newStoreId = e.target.value || null;
                      if (onAssignChat) {
                        await onAssignChat(activeChat.id, { storeId: newStoreId, assignedUserId: activeChat.assignedUserId });
                      }
                    }}
                    className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary,#111b21)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] cursor-pointer"
                  >
                    <option value="">Sem Filial Atribuída</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Atendente */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-primary,#111b21)] flex items-center gap-1.5">
                    <UserCheck size={13} className="text-[var(--brand-primary,#00a884)]" />
                    <span>Consultor de Vendas</span>
                  </label>
                  <select
                    value={activeChat.assignedUserId || ''}
                    onChange={async (e) => {
                      const newUserId = e.target.value || null;
                      if (onAssignChat) {
                        await onAssignChat(activeChat.id, { storeId: activeChat.storeId, assignedUserId: newUserId });
                      }
                    }}
                    className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary,#111b21)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] cursor-pointer"
                  >
                    <option value="">Não Atribuído</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.role === 'ADMIN' ? 'Admin' : 'Operador'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Resumo de Tags Rápidas no Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider">
                  Tags Ativas ({currentTags.length})
                </span>
                <button
                  onClick={() => setActiveTab('tags')}
                  className="text-[11px] text-[var(--brand-primary,#00a884)] font-semibold hover:underline"
                >
                  Gerenciar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentTags.length > 0 ? (
                  currentTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] text-[var(--text-primary,#111b21)]"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-secondary,#667781)] italic">
                    Nenhuma tag atribuída.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: FUNIL COMERCIAL */}
        {activeTab === 'funnel' && (
          <div className="space-y-4 animate-fade-in">
            {funnelStepperSlot ? funnelStepperSlot : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[var(--brand-primary,#00a884)]" />
                  <span className="text-xs font-bold text-[var(--text-primary,#111b21)]">
                    Estágio no Pipeline de Vendas
                  </span>
                </div>

                <div className="space-y-2">
                  {['LEAD', 'NEGOTIATION', 'PROPOSAL', 'CLOSED'].map((stageKey) => {
                    const token = TOKENS.colors.funnel[stageKey];
                    const isSelected = funnelStage === stageKey;

                    return (
                      <button
                        key={stageKey}
                        onClick={() => onUpdateFunnelStage && onUpdateFunnelStage(activeChat.id, stageKey)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-l-4 shadow-sm'
                            : 'bg-[var(--bg-panel,#ffffff)] border-[var(--border-subtle,#e9edef)] hover:bg-[var(--active-bg,#f0f2f5)]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? token.bg : undefined,
                          borderColor: isSelected ? token.color : undefined,
                          borderLeftWidth: isSelected ? '4px' : undefined
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: token.color }} 
                          />
                          <div>
                            <span 
                              className="text-xs font-bold block"
                              style={{ color: isSelected ? token.color : 'inherit' }}
                            >
                              {token.label}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
                              {stageKey === 'LEAD' && 'Primeiro contato realizado'}
                              {stageKey === 'NEGOTIATION' && 'Interesse em modelos ou cotação'}
                              {stageKey === 'PROPOSAL' && 'Simulação ou proposta formal enviada'}
                              {stageKey === 'CLOSED' && 'Venda concluída com sucesso!'}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: token.color }}
                          >
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: HISTÓRICO & NOTAS */}
        {activeTab === 'notes' && (
          <div className="space-y-3 flex-1 flex flex-col animate-fade-in">
            {notesSectionSlot ? notesSectionSlot : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText size={15} className="text-[var(--brand-primary,#00a884)]" />
                    <span className="text-xs font-bold text-[var(--text-primary,#111b21)]">
                      Anotações Comerciais
                    </span>
                  </div>
                  {notesSavedAlert && (
                    <span className="text-[11px] text-[var(--brand-primary,#00a884)] font-bold animate-pulse flex items-center gap-1">
                      <Check size={12} />
                      Salvo!
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-secondary,#667781)]">
                  Registre informações chave: interesse em motos, formas de pagamento ou preferências do lead.
                </p>

                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  placeholder="Ex: Cliente tem interesse na Shineray Storm 200. Pretende dar entrada de 5 mil..."
                  rows={8}
                  className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-xl p-3 text-xs text-[var(--text-primary,#111b21)] placeholder-[var(--text-secondary,#667781)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] resize-none"
                />

                <button
                  onClick={handleSaveNotesClick}
                  disabled={isSavingNotes}
                  className="w-full py-2.5 rounded-xl bg-[var(--brand-primary,#00a884)] hover:bg-[#008f6f] disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isSavingNotes ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>{isSavingNotes ? 'Salvando...' : 'Salvar Anotações'}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ABA 4: GERENCIADOR DE TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-4 animate-fade-in">
            {tagsManagerSlot ? tagsManagerSlot : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Tag size={15} className="text-[var(--brand-primary,#00a884)]" />
                    <span className="text-xs font-bold text-[var(--text-primary,#111b21)]">
                      Classificadores e Etiquetas
                    </span>
                  </div>
                  
                  {/* Formulário de criação de tag */}
                  <form onSubmit={handleAddTagSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nova tag (ex: Consórcio)..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary,#111b21)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)]"
                    />
                    <button
                      type="submit"
                      disabled={!tagInput.trim()}
                      className="px-3 bg-[var(--brand-primary,#00a884)] hover:bg-[#008f6f] disabled:opacity-40 text-white rounded-lg font-bold text-xs flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      <Plus size={14} />
                    </button>
                  </form>
                </div>

                {/* Tags Atuais com botão de exclusão */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
                    Etiquetas deste Cliente
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 rounded-xl bg-[var(--active-bg,#f0f2f5)]/60 border border-[var(--border-subtle,#e9edef)]">
                    {currentTags.length > 0 ? (
                      currentTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] text-[11px] font-bold text-[var(--text-primary,#111b21)] shadow-xs"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => onRemoveTag && onRemoveTag(tag)}
                            className="text-[var(--text-secondary,#667781)] hover:text-rose-500 transition-colors p-0.5"
                            title={`Remover tag ${tag}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--text-secondary,#667781)] italic">
                        Nenhuma etiqueta atribuída.
                      </span>
                    )}
                  </div>
                </div>

                {/* Sugestões Rápidas de Tags */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
                    Sugestões Rápidas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickTags.map((qTag) => {
                      const isAdded = currentTags.includes(qTag);
                      return (
                        <button
                          key={qTag}
                          disabled={isAdded}
                          onClick={() => onAddTag && onAddTag(qTag)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                            isAdded
                              ? 'bg-[var(--brand-primary,#00a884)]/10 text-[var(--brand-primary,#00a884)] border-[var(--brand-primary,#00a884)]/30 opacity-60 cursor-default'
                              : 'bg-[var(--bg-panel,#ffffff)] hover:bg-[var(--active-bg,#f0f2f5)] text-[var(--text-primary,#111b21)] border-[var(--border-subtle,#e9edef)] active:scale-95'
                          }`}
                        >
                          + {qTag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* 4. RODAPÉ DO PAINEL */}
      <footer className="p-3 border-t border-[var(--border-subtle,#e9edef)] bg-[var(--header-bg,#f0f2f5)] text-[10px] text-[var(--text-secondary,#667781)] flex items-center justify-between shrink-0 transition-colors">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-[var(--brand-primary,#00a884)]" />
          <span>Sincronização Segura</span>
        </span>
        <span className="font-medium">
          PixelCRM Shineray
        </span>
      </footer>

    </div>
  );
}
