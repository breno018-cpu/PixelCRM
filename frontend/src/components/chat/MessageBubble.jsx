// frontend/src/components/chat/MessageBubble.jsx
// Balão Individual de Mensagem (PROMPT 04 - ETAPA 06)
// Ergonomia e densidade fiel aos balões do WhatsApp Web

import React, { useState } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Copy, FileText, Image, Mic } from 'lucide-react';

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Destaque de texto quando houver busca ativa no chat
function highlightSearchTerm(text, query) {
  if (!query || !query.trim() || !text) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-amber-300 text-black px-0.5 rounded-xs font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function MessageBubble({
  message,
  searchQuery = '',
  mediaComponent = null,
  onCopy
}) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isMe = Boolean(message.fromMe);
  const timeFormatted = formatMessageTime(message.timestamp);

  const handleCopyText = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy(message.text);
  };

  // Ícone de Status da Mensagem (quando enviada pelo atendente)
  const renderStatusIcon = () => {
    if (!isMe) return null;

    if (message.isTemporary || message.status === 'sending') {
      return <Clock size={12} className="text-[var(--text-muted)] animate-pulse" title="Enviando..." />;
    }
    if (message.status === 'failed') {
      return <AlertCircle size={12} className="text-rose-500" title="Falha no envio" />;
    }
    if (message.status === 'sent') {
      return <Check size={14} className="text-[var(--text-muted)]" title="Enviada" />;
    }
    // Entregue ou Lida (Padrão WhatsApp: duplo check azul/ciano)
    return <CheckCheck size={14} className="text-[#53bdeb]" title="Entregue/Lida" />;
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex w-full my-1 relative group px-2 sm:px-4 ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`
          relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-3.5 py-2 shadow-xs transition-colors
          ${isMe
            ? 'bg-[var(--bubble-out)] text-[var(--text-primary)] rounded-tr-xs'
            : 'bg-[var(--bubble-in)] text-[var(--text-primary)] rounded-tl-xs border border-[var(--border-light)]/40'
          }
        `}
      >
        {/* Componente Customizado de Mídia (Áudio/Imagem/Documento) */}
        {mediaComponent}

        {/* Texto da Mensagem */}
        {message.text && (
          <div className="text-[13.5px] leading-relaxed break-words whitespace-pre-wrap select-text">
            {searchQuery ? highlightSearchTerm(message.text, searchQuery) : message.text}
          </div>
        )}

        {/* Rodapé do Balão: Horário e Status */}
        <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 ml-3 select-none text-[10.5px] text-[var(--text-secondary)]">
          <span>{timeFormatted}</span>
          {renderStatusIcon()}
        </div>

        {/* Botão Rápido de Copiar no Hover */}
        {isHovered && message.text && (
          <button
            type="button"
            onClick={handleCopyText}
            className={`
              absolute -top-3 p-1 rounded-full bg-[var(--sidebar-bg)] border border-[var(--border-light)] shadow-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all animate-fade-in
              ${isMe ? '-left-3' : '-right-3'}
            `}
            title={copied ? "Copiado!" : "Copiar texto"}
          >
            {copied ? (
              <Check size={12} className="text-[#00a884]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
