import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Trophy, 
  UserPlus, 
  MessageSquareQuote, 
  FileSpreadsheet, 
  Sparkles,
  TrendingUp,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { TOKENS } from '../../design-system/tokens';

const STAGES = [
  {
    key: 'LEAD',
    step: 1,
    label: 'Lead Novo',
    shortLabel: 'Lead',
    description: 'Primeiro contato realizado via WhatsApp. Identificação do modelo Shineray de interesse.',
    icon: UserPlus,
    percent: 15
  },
  {
    key: 'NEGOTIATION',
    step: 2,
    label: 'Em Negociação',
    shortLabel: 'Negociação',
    description: 'Apresentação de condições comerciais, cores disponíveis e simulações preliminares.',
    icon: MessageSquareQuote,
    percent: 50
  },
  {
    key: 'PROPOSAL',
    step: 3,
    label: 'Proposta Enviada',
    shortLabel: 'Proposta',
    description: 'Simulação formal de financiamento, consórcio ou proposta de pagamento à vista enviada.',
    icon: FileSpreadsheet,
    percent: 85
  },
  {
    key: 'CLOSED',
    step: 4,
    label: 'Contrato Fechado',
    shortLabel: 'Fechado',
    description: 'Venda confirmada! Documentação aprovada e moto pronta para faturamento/entrega.',
    icon: Trophy,
    percent: 100
  }
];

/**
 * FunnelStepper
 * Rastreador visual interativo do Pipeline Comercial Shineray.
 * Fornece stepper horizontal, progresso percentual, botões de avanço rápido
 * e seleção detalhada dos 4 estágios do funil.
 */
export default function FunnelStepper({
  activeChat,
  onUpdateFunnelStage,
  compact = false
}) {
  const [updatingStage, setUpdatingStage] = useState(null);

  if (!activeChat) return null;

  const currentStageKey = activeChat.funnelStage || 'LEAD';
  const currentIndex = STAGES.findIndex(s => s.key === currentStageKey);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStage = STAGES[safeIndex];

  const handleSelectStage = async (newStageKey) => {
    if (newStageKey === currentStageKey || updatingStage) return;

    try {
      setUpdatingStage(newStageKey);
      if (onUpdateFunnelStage) {
        await onUpdateFunnelStage(activeChat.id, newStageKey);
      }
    } catch (err) {
      console.error('[FunnelStepper] Erro ao atualizar estágio:', err);
    } finally {
      setUpdatingStage(null);
    }
  };

  const handleNextStage = () => {
    if (safeIndex < STAGES.length - 1) {
      const nextStageKey = STAGES[safeIndex + 1].key;
      handleSelectStage(nextStageKey);
    }
  };

  // Cálculo da barra de progresso (0%, 33.3%, 66.6%, 100%)
  const progressPercent = (safeIndex / (STAGES.length - 1)) * 100;
  const currentToken = TOKENS.colors.funnel[currentStageKey] || TOKENS.colors.funnel.LEAD;

  return (
    <div className="w-full space-y-5 bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
      
      {/* 1. CABEÇALHO DO FUNIL COM PROGRESSO PERCENTUAL */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: currentToken.color }}
          >
            <TrendingUp size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary,#111b21)] leading-tight">
              Pipeline de Vendas
            </h4>
            <span className="text-[10px] text-[var(--text-secondary,#667781)]">
              Etapa {safeIndex + 1} de 4 &bull; {currentStage.shortLabel}
            </span>
          </div>
        </div>

        <span 
          className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs border"
          style={{ 
            backgroundColor: currentToken.bgLight || 'var(--active-bg)', 
            color: currentToken.color,
            borderColor: currentToken.borderLight || 'transparent'
          }}
        >
          {Math.round(progressPercent)}% Concluído
        </span>
      </div>

      {/* 2. STEPPER VISUAL HORIZONTAL */}
      <div className="relative pt-2 pb-1 px-1">
        {/* Linha de fundo cinza */}
        <div className="absolute top-5 left-4 right-4 h-1 bg-[var(--border-subtle,#e9edef)] -translate-y-1/2 z-0" />
        
        {/* Linha preenchida com gradiente de progresso */}
        <div 
          className="absolute top-5 left-4 h-1 bg-[var(--brand-primary,#00a884)] -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `calc(${progressPercent}% * 0.88)` }}
        />

        {/* 4 Pontos do Stepper */}
        <div className="relative z-10 flex justify-between items-start">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < safeIndex;
            const isCurrent = idx === safeIndex;
            const token = TOKENS.colors.funnel[s.key];

            return (
              <button
                key={s.key}
                onClick={() => handleSelectStage(s.key)}
                disabled={updatingStage !== null}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
                title={`${s.label}: ${s.description}`}
              >
                {/* Círculo do Passo */}
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                    isCompleted
                      ? 'bg-[#00a884] border-[#00a884] text-white shadow-xs'
                      : isCurrent
                      ? 'border-2 scale-110 shadow-md text-white'
                      : 'bg-[var(--bg-panel,#ffffff)] border-[var(--border-subtle,#e9edef)] text-[var(--text-secondary,#667781)] group-hover:border-slate-400'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? token.color : undefined,
                    borderColor: isCurrent ? token.color : undefined
                  }}
                >
                  {isCompleted ? (
                    <Check size={13} strokeWidth={3} />
                  ) : updatingStage === s.key ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                {/* Legenda do Passo */}
                <span 
                  className={`mt-1.5 text-[9px] font-semibold tracking-tight transition-colors ${
                    isCurrent 
                      ? 'font-bold' 
                      : 'text-[var(--text-secondary,#667781)]'
                  }`}
                  style={{ color: isCurrent ? token.color : undefined }}
                >
                  {s.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CARD DO ESTÁGIO ATUAL COM AÇÕES RÁPIDAS */}
      <div 
        className="p-3.5 rounded-xl border transition-all"
        style={{
          backgroundColor: currentToken.bgLight ? `${currentToken.bgLight}20` : 'var(--active-bg)',
          borderColor: currentToken.borderLight || currentToken.color
        }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5"
            style={{ backgroundColor: currentToken.color }}
          >
            {React.createElement(currentStage.icon, { size: 16 })}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-primary,#111b21)]">
                {currentStage.label}
              </span>
              {currentStageKey === 'CLOSED' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00a884] text-white font-bold animate-pulse">
                  Ganha!
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary,#667781)] mt-0.5 leading-relaxed">
              {currentStage.description}
            </p>
          </div>
        </div>

        {/* Botão de Avanço Rápido */}
        <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle,#e9edef)]/60 flex items-center justify-between gap-2">
          {safeIndex < STAGES.length - 1 ? (
            <>
              <button
                onClick={handleNextStage}
                disabled={updatingStage !== null}
                className="flex-1 py-1.5 px-3 rounded-lg text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                style={{ backgroundColor: currentToken.color }}
              >
                <span>Avançar para {STAGES[safeIndex + 1].shortLabel}</span>
                <ArrowRight size={13} />
              </button>

              {currentStageKey !== 'CLOSED' && safeIndex < 2 && (
                <button
                  onClick={() => handleSelectStage('CLOSED')}
                  disabled={updatingStage !== null}
                  className="px-3 py-1.5 rounded-lg bg-[#00a884]/15 hover:bg-[#00a884]/25 text-[#00a884] font-bold text-xs inline-flex items-center gap-1 transition-all active:scale-95"
                  title="Marcar contrato como fechado imediatamente"
                >
                  <Trophy size={13} />
                  <span>Fechar</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs font-semibold text-[#00a884]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Venda Shineray Concluída!</span>
              </span>
              <button
                onClick={() => handleSelectStage('LEAD')}
                className="text-[10px] text-[var(--text-secondary,#667781)] hover:underline inline-flex items-center gap-1"
                title="Reabrir este lead no início do funil"
              >
                <RotateCcw size={10} />
                <span>Reiniciar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. LISTA COMPLETA DOS ESTÁGIOS PARA SELEÇÃO MANUAL */}
      {!compact && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
            Alterar Etapa Manualmente
          </span>

          <div className="grid grid-cols-1 gap-1.5">
            {STAGES.map((s) => {
              const token = TOKENS.colors.funnel[s.key];
              const isSelected = currentStageKey === s.key;
              const Icon = s.icon;

              return (
                <button
                  key={s.key}
                  onClick={() => handleSelectStage(s.key)}
                  disabled={updatingStage !== null}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-l-4 shadow-xs'
                      : 'bg-[var(--bg-panel,#ffffff)] border-[var(--border-subtle,#e9edef)] hover:bg-[var(--active-bg,#f0f2f5)]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? (token.bgLight ? `${token.bgLight}25` : 'var(--active-bg)') : undefined,
                    borderColor: isSelected ? token.color : undefined,
                    borderLeftWidth: isSelected ? '4px' : undefined
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: isSelected ? token.color : 'var(--active-bg)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      <Icon size={13} />
                    </div>
                    
                    <div className="truncate">
                      <span 
                        className="text-xs font-bold block truncate"
                        style={{ color: isSelected ? token.color : 'inherit' }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: token.color }}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
