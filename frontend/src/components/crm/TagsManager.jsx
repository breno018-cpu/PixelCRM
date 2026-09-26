import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

// Sugestões comerciais categorizadas específicas para a concessionária Shineray
const SUGGESTED_TAG_GROUPS = [
  {
    category: 'Modelos & Veículos',
    tags: ['Scooter Elétrica', 'Storm 200', 'Worker 125', 'SHI 175', 'Phoenix S']
  },
  {
    category: 'Negociação & Pagamento',
    tags: ['Lead Quente', 'Financiamento', 'Consórcio', 'Test-Ride', 'Entrada Facilitada']
  },
  {
    category: 'Operacional',
    tags: ['Documentação', 'Aguardando Aprovação', 'Pós-Venda', 'Indicação']
  }
];

/**
 * TagsManager
 * Gerenciador moderno de tags e classificadores do cliente Shineray.
 * Suporta adição manual, remoção, chips interativos e sugestões rápidas por categoria.
 */
export default function TagsManager({
  activeChat,
  onAddTag,
  onRemoveTag,
  disabled = false
}) {
  const [tagInput, setTagInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  if (!activeChat) return null;

  const currentTags = activeChat.tags 
    ? activeChat.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!cleanTag || disabled) return;

    if (!currentTags.includes(cleanTag) && onAddTag) {
      onAddTag(cleanTag);
    }
    setTagInput('');
  };

  const handleQuickAdd = (tag) => {
    if (disabled || currentTags.includes(tag)) return;
    if (onAddTag) {
      onAddTag(tag);
    }
  };

  const handleRemove = (tag) => {
    if (disabled || !onRemoveTag) return;
    onRemoveTag(tag);
  };

  return (
    <div className="w-full space-y-4 bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-2xl p-4 shadow-xs transition-colors">
      
      {/* 1. CABEÇALHO COM CONTADOR DE TAGS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary,#00a884)]/10 text-[var(--brand-primary,#00a884)] flex items-center justify-center shrink-0">
            <Tag size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary,#111b21)] leading-tight">
              Classificadores e Etiquetas
            </h4>
            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
              {currentTags.length} {currentTags.length === 1 ? 'etiqueta ativa' : 'etiquetas ativas'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FORMULÁRIO DE CRIAÇÃO RÁPIDA */}
      <form onSubmit={handleAddSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary,#667781)] text-xs font-bold select-none">
            #
          </span>
          <input
            type="text"
            placeholder="Nova etiqueta (ex: Financiamento)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            disabled={disabled}
            className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-xl pl-7 pr-3 py-2 text-xs text-[var(--text-primary,#111b21)] placeholder-[var(--text-secondary,#667781)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!tagInput.trim() || disabled}
          className="px-3.5 bg-[var(--brand-primary,#00a884)] hover:bg-[#008f6f] disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all shadow-xs active:scale-95"
          title="Adicionar Etiqueta"
        >
          <Plus size={15} />
        </button>
      </form>

      {/* 3. LISTA DE TAGS ATIVAS DO CLIENTE */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
          Etiquetas Vinculadas
        </span>

        <div className="min-h-[44px] p-2.5 rounded-xl bg-[var(--active-bg,#f0f2f5)]/50 border border-[var(--border-subtle,#e9edef)] flex flex-wrap gap-1.5 items-center">
          {currentTags.length > 0 ? (
            currentTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] text-[11px] font-bold text-[var(--text-primary,#111b21)] shadow-xs transition-transform hover:scale-102"
              >
                <span className="text-[var(--brand-primary,#00a884)]">#</span>
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(tag)}
                  disabled={disabled}
                  className="text-[var(--text-secondary,#667781)] hover:text-rose-500 rounded p-0.5 transition-colors focus:outline-none"
                  title={`Remover tag ${tag}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <div className="w-full text-center py-1">
              <span className="text-xs text-[var(--text-secondary,#667781)] italic">
                Nenhuma etiqueta cadastrada para este lead.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SUGESTÕES RÁPIDAS DA SHINERAY POR CATEGORIA */}
      <div className="space-y-2.5 pt-1 border-t border-[var(--border-subtle,#e9edef)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-[var(--brand-primary,#00a884)]" />
            <span>Sugestões Comerciais Shineray</span>
          </span>
        </div>

        <div className="space-y-2">
          {SUGGESTED_TAG_GROUPS.map((group) => (
            <div key={group.category} className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--text-secondary,#667781)] block">
                {group.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.tags.map((sugTag) => {
                  const isAdded = currentTags.includes(sugTag);
                  return (
                    <button
                      key={sugTag}
                      type="button"
                      disabled={isAdded || disabled}
                      onClick={() => handleQuickAdd(sugTag)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border inline-flex items-center gap-1 ${
                        isAdded
                          ? 'bg-[var(--brand-primary,#00a884)]/10 text-[var(--brand-primary,#00a884)] border-[var(--brand-primary,#00a884)]/30 opacity-70 cursor-default'
                          : 'bg-[var(--bg-panel,#ffffff)] hover:bg-[var(--active-bg,#f0f2f5)] text-[var(--text-primary,#111b21)] border-[var(--border-subtle,#e9edef)] active:scale-95 shadow-xs'
                      }`}
                    >
                      {isAdded ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                      <span>{sugTag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
