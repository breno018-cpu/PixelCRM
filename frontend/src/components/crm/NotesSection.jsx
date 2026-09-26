import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Check, 
  Loader2, 
  Clock, 
  History, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

/**
 * NotesSection
 * Anotações comerciais e histórico de interação com o cliente Shineray.
 * Suporta salvamento com atalho de teclado (Ctrl+Enter), feedback visual
 * e registro contextual.
 */
export default function NotesSection({
  activeChat,
  onSaveNotes,
  isSavingNotes = false,
  notesSavedAlert = false,
  disabled = false
}) {
  const [notes, setNotes] = useState(activeChat?.notes || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNotes(activeChat?.notes || '');
    setHasChanges(false);
  }, [activeChat?.id, activeChat?.notes]);

  if (!activeChat) return null;

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setHasChanges(e.target.value !== (activeChat.notes || ''));
  };

  const handleSave = () => {
    if (disabled || isSavingNotes) return;
    if (onSaveNotes) {
      onSaveNotes(notes);
      setHasChanges(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const charCount = notes.length;
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  // Formatação de data do último contato
  const lastContactDate = activeChat.lastMessageAt
    ? new Date(activeChat.lastMessageAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Ainda não registrado';

  return (
    <div className="w-full space-y-4 bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col">
      
      {/* 1. CABEÇALHO DA SEÇÃO DE NOTAS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary,#00a884)]/10 text-[var(--brand-primary,#00a884)] flex items-center justify-center shrink-0">
            <FileText size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary,#111b21)] leading-tight">
              Anotações & Histórico
            </h4>
            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
              Registro comercial do lead
            </span>
          </div>
        </div>

        {/* Feedback de salvamento */}
        {notesSavedAlert ? (
          <span className="text-[11px] text-[var(--brand-primary,#00a884)] font-bold flex items-center gap-1 animate-fade-in">
            <Check size={13} strokeWidth={3} />
            Salvo com sucesso!
          </span>
        ) : hasChanges ? (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Alterações pendentes
          </span>
        ) : null}
      </div>

      {/* 2. TEXTAREA PRINCIPAL */}
      <div className="space-y-1.5">
        <textarea
          value={notes}
          onChange={handleNotesChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSavingNotes}
          rows={7}
          placeholder="Registre aqui informações essenciais sobre o cliente: modelos de moto de interesse, entrada disponível, profissão, restrições cadastrais ou preferências de contato..."
          className="w-full bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] rounded-xl p-3.5 text-xs text-[var(--text-primary,#111b21)] placeholder-[var(--text-secondary,#667781)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary,#00a884)] transition-all resize-none leading-relaxed"
        />

        {/* Barra de status do editor */}
        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary,#667781)] px-1">
          <span>{wordCount} {wordCount === 1 ? 'palavra' : 'palavras'} &bull; {charCount} caracteres</span>
          <span className="hidden sm:inline opacity-75">
            Pressione <kbd className="font-mono bg-[var(--active-bg,#f0f2f5)] px-1 py-0.5 rounded border border-[var(--border-subtle,#e9edef)]">Ctrl+Enter</kbd> para salvar
          </span>
        </div>
      </div>

      {/* 3. BOTÃO DE SALVAR */}
      <button
        type="button"
        onClick={handleSave}
        disabled={disabled || isSavingNotes || (!hasChanges && !notes)}
        className="w-full py-2.5 rounded-xl bg-[var(--brand-primary,#00a884)] hover:bg-[#008f6f] disabled:opacity-40 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
      >
        {isSavingNotes ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Save size={13} />
        )}
        <span>{isSavingNotes ? 'Salvando no banco...' : 'Salvar Anotações'}</span>
      </button>

      {/* 4. HISTÓRICO COMERCIAL RÁPIDO */}
      <div className="pt-3 border-t border-[var(--border-subtle,#e9edef)] space-y-2">
        <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
          Linha do Tempo
        </span>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--active-bg,#f0f2f5)]/40 border border-[var(--border-subtle,#e9edef)]">
            <Clock size={13} className="text-[var(--brand-primary,#00a884)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-primary,#111b21)] block">
                Última Interação no WhatsApp
              </span>
              <span className="text-[10px] text-[var(--text-secondary,#667781)]">
                {lastContactDate}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
