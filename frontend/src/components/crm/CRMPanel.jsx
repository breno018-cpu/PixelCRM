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

import CustomerProfile from './CustomerProfile';
import AssignmentSelector from './AssignmentSelector';
import FunnelStepper from './FunnelStepper';
import TagsManager from './TagsManager';
import NotesSection from './NotesSection';

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
  onUpdateName,
  isUpdatingName = false,
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
      <nav 
        role="tablist" 
        aria-label="Abas do perfil do lead"
        className="flex items-center border-b border-[var(--border-subtle,#e9edef)] bg-[var(--bg-panel,#ffffff)] px-2 shrink-0"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all focus-visible:ring-1 focus-visible:ring-[var(--brand-primary,#00a884)] ${
            activeTab === 'overview'
              ? 'border-[var(--brand-primary,#00a884)] text-[var(--brand-primary,#00a884)]'
              : 'border-transparent text-[var(--text-secondary,#667781)] hover:text-[var(--text-primary,#111b21)]'
          }`}
        >
          Geral
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'funnel'}
          onClick={() => setActiveTab('funnel')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 focus-visible:ring-1 focus-visible:ring-[var(--brand-primary,#00a884)] ${
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
          role="tab"
          aria-selected={activeTab === 'notes'}
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 focus-visible:ring-1 focus-visible:ring-[var(--brand-primary,#00a884)] ${
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
          role="tab"
          aria-selected={activeTab === 'tags'}
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1 focus-visible:ring-1 focus-visible:ring-[var(--brand-primary,#00a884)] ${
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
              <CustomerProfile
                activeChat={activeChat}
                onUpdateName={onUpdateName}
                isUpdatingName={isUpdatingName}
              />
            )}

            {/* Slot de Atribuições ou Seletor Padrão */}
            {assignmentSlot ? assignmentSlot : (
              <AssignmentSelector
                activeChat={activeChat}
                stores={stores}
                users={users}
                onAssignChat={onAssignChat}
              />
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
              <FunnelStepper
                activeChat={activeChat}
                onUpdateFunnelStage={onUpdateFunnelStage}
              />
            )}
          </div>
        )}

        {/* ABA 3: HISTÓRICO & NOTAS */}
        {activeTab === 'notes' && (
          <div className="space-y-3 flex-1 flex flex-col animate-fade-in">
            {notesSectionSlot ? notesSectionSlot : (
              <NotesSection
                activeChat={activeChat}
                onSaveNotes={onSaveNotes}
                isSavingNotes={isSavingNotes}
                notesSavedAlert={notesSavedAlert}
              />
            )}
          </div>
        )}

        {/* ABA 4: GERENCIADOR DE TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-4 animate-fade-in">
            {tagsManagerSlot ? tagsManagerSlot : (
              <TagsManager
                activeChat={activeChat}
                onAddTag={onAddTag}
                onRemoveTag={onRemoveTag}
              />
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
