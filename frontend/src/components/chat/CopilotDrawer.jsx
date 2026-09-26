// frontend/src/components/chat/CopilotDrawer.jsx
// Painel Flutuante e Pílulas de Ação do Copiloto Comercial IA (PROMPT 04 - ETAPA 09)

import React from 'react';
import { 
  Sparkles, X, Loader2, AlertCircle, SendHorizontal, 
  Copy, CheckCheck, RefreshCw, Sliders 
} from 'lucide-react';

export default function CopilotDrawer({
  isOpen = false,
  onClose,
  isGenerating = false,
  suggestion = null,
  error = null,
  onTrigger,
  onApply,
  onCopy,
  isCopied = false,
  onOpenSettings,
  aiConfig = null,
  canImprove = false
}) {
  return (
    <>
      {/* 1. PAINEL EXPANSÍVEL DE SUGESTÃO DE IA */}
      {isOpen && (
        <div className="bg-[var(--sidebar-bg)] border-t border-[var(--border-light)] px-4 py-3 shadow-lg z-20 animate-fade-in select-none">
          <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Header do Copiloto */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles size={14} />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Copiloto Comercial IA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700">
                  {aiConfig?.provider === 'openai' ? 'OpenAI' : 'Google Gemini'} ({aiConfig?.model || 'gemini-1.5-flash'})
                </span>
              </div>

              <div className="flex items-center gap-1">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="p-1 hover:bg-[var(--active-bg)] rounded-full text-[var(--text-muted)] hover:text-purple-600 transition-colors"
                    title="Configurações de IA"
                  >
                    <Sliders size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--active-bg)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title="Fechar Copiloto"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Estado: Processando / Gerando */}
            {isGenerating && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 size={24} className="animate-spin text-purple-600" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Consultando Inteligência Artificial...
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Analisando histórico recente do WhatsApp e gerando recomendação comercial.
                  </p>
                </div>
              </div>
            )}

            {/* Estado: Erro */}
            {!isGenerating && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-700">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </div>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-xs shrink-0 transition-colors"
                  >
                    Configurar Chave de IA
                  </button>
                )}
              </div>
            )}

            {/* Estado: Sugestão Gerada */}
            {!isGenerating && suggestion?.text && (
              <div className="space-y-3">
                <div className="bg-[var(--header-bg)] border border-[var(--border-light)] rounded-xl p-3 max-h-56 overflow-y-auto">
                  <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed select-text font-normal">
                    {suggestion.text}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onApply && onApply(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                      title="Inserir no campo de envio"
                    >
                      <SendHorizontal size={14} />
                      <span>Inserir no Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCopy && onCopy(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--sidebar-bg)] border border-[var(--border-light)] hover:bg-[var(--active-bg)] text-xs font-semibold text-[var(--text-secondary)] rounded-xl transition-colors"
                      title="Copiar texto gerado"
                    >
                      {isCopied ? (
                        <>
                          <CheckCheck size={14} className="text-[#00a884]" />
                          <span className="text-[#00a884] font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTrigger && onTrigger(suggestion.mode || 'suggest')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)] rounded-lg transition-colors"
                    title="Gerar nova variação"
                  >
                    <RefreshCw size={13} />
                    <span>Regenerar</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. BARRA DE PÍLULAS DE AÇÃO RÁPIDA (ACIMA DO COMPOSITOR) */}
      <div className="bg-[var(--header-bg)] px-4 pt-1.5 pb-0 flex items-center justify-between text-[11px] border-t border-[var(--border-light)] select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-purple-700 dark:text-purple-400 font-bold flex items-center gap-1 shrink-0">
            <Sparkles size={12} className="text-purple-600" />
            Copiloto:
          </span>

          <button
            type="button"
            onClick={() => onTrigger && onTrigger('suggest')}
            className="px-2.5 py-1 rounded-full bg-[var(--sidebar-bg)] hover:bg-purple-50 text-[var(--text-secondary)] hover:text-purple-700 border border-[var(--border-light)] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs"
          >
            Sugerir Resposta
          </button>

          <button
            type="button"
            disabled={!canImprove}
            onClick={() => onTrigger && onTrigger('improve')}
            className="px-2.5 py-1 rounded-full bg-[var(--sidebar-bg)] hover:bg-purple-50 text-[var(--text-secondary)] hover:text-purple-700 border border-[var(--border-light)] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs disabled:opacity-40 disabled:hover:bg-[var(--sidebar-bg)] disabled:hover:text-[var(--text-secondary)]"
          >
            Melhorar Rascunho
          </button>

          <button
            type="button"
            onClick={() => onTrigger && onTrigger('summarize')}
            className="px-2.5 py-1 rounded-full bg-[var(--sidebar-bg)] hover:bg-purple-50 text-[var(--text-secondary)] hover:text-purple-700 border border-[var(--border-light)] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs"
          >
            Resumir Conversa
          </button>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 text-[var(--text-muted)] hover:text-purple-600 rounded-md hover:bg-[var(--sidebar-bg)] transition-colors shrink-0 ml-2"
            title="Configurações de IA"
          >
            <Sliders size={13} />
          </button>
        )}
      </div>
    </>
  );
}
