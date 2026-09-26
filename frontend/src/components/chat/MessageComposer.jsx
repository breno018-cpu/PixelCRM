// frontend/src/components/chat/MessageComposer.jsx
// Compositor de Mensagens com Ergonomia do WhatsApp Web (PROMPT 04 - ETAPA 07)

import React, { useRef, useState, useEffect } from 'react';
import { 
  Smile, Paperclip, Send, Loader2, Mic, Image, 
  FileText, X, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function MessageComposer({
  value = '',
  onChange,
  onSend,
  disabled = false,
  isSending = false,
  sendError = '',
  onClearError,
  onAttachFile,
  placeholder = "Digite uma mensagem"
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-ajuste de altura do campo de texto (até 5 linhas)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${Math.max(nextHeight, 38)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isSending) {
        onSend();
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onAttachFile) {
      onAttachFile(file);
    }
    setShowAttachMenu(false);
    e.target.value = '';
  };

  // Emojis rápidos frequentes de atendimento comercial
  const quickEmojis = ['👋', '🏍️', '✅', '🙏', '😊', '🤝', '🚀', '⭐', '📍', '💰'];

  const addEmoji = (emoji) => {
    onChange((value || '') + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-[var(--header-bg)] border-t border-[var(--border-light)] px-3 py-2 shrink-0 z-20 select-none relative transition-colors">
      
      {/* Alerta Flutuante de Erro de Envio */}
      {sendError && (
        <div className="absolute -top-12 left-4 right-4 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center justify-between shadow-md animate-fade-in z-30">
          <div className="flex items-center gap-2 truncate mr-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span className="truncate">{sendError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSend}
              className="text-[11px] font-bold text-rose-800 hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} /> Tentar de novo
            </button>
            {onClearError && (
              <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-800">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popover de Emojis Rápidos */}
      {showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowEmojiPicker(false)} />
          <div className="absolute bottom-16 left-3 bg-[var(--sidebar-bg)] border border-[var(--border-light)] rounded-2xl p-2 shadow-xl z-30 flex items-center gap-1.5 animate-pop-in">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--active-bg)] text-base flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Menu de Anexos */}
      {showAttachMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowAttachMenu(false)} />
          <div className="absolute bottom-16 left-12 bg-[var(--sidebar-bg)] border border-[var(--border-light)] rounded-2xl p-2 shadow-xl z-30 flex flex-col gap-1 w-44 animate-pop-in text-xs font-semibold text-[var(--text-primary)]">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*,video/*";
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--active-bg)] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Image size={15} />
              </div>
              <span>Fotos e Vídeos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt";
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--active-bg)] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText size={15} />
              </div>
              <span>Documento</span>
            </button>
          </div>
        </>
      )}

      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Barra do Compositor */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim() && !disabled && !isSending) {
            onSend();
          }
        }}
        className="flex items-end gap-2 max-w-5xl mx-auto"
      >
        {/* Botão de Emojis */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          disabled={disabled}
          className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)] transition-colors shrink-0 disabled:opacity-40"
          title="Emojis"
          aria-label="Abrir catálogo de emojis"
          aria-expanded={showEmojiPicker}
          aria-haspopup="dialog"
        >
          <Smile size={22} />
        </button>

        {/* Botão de Anexo */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(prev => !prev)}
          disabled={disabled}
          className={`p-2 rounded-full transition-colors shrink-0 disabled:opacity-40 ${
            showAttachMenu 
              ? 'bg-[var(--active-bg)] text-[#00a884]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)]'
          }`}
          title="Anexar arquivo"
          aria-label="Anexar arquivo ou mídia"
          aria-expanded={showAttachMenu}
          aria-haspopup="menu"
        >
          <Paperclip size={22} className={showAttachMenu ? "rotate-45" : ""} />
        </button>

        {/* Campo de Texto Multilinha Expansível */}
        <div className="flex-1 bg-[var(--input-bg)] border border-[var(--border-light)] focus-within:border-[#00a884]/60 focus-within:ring-1 focus-within:ring-[#00a884]/20 rounded-2xl px-3.5 py-1.5 flex items-center shadow-2xs transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            aria-label="Digite uma mensagem"
            placeholder={
              disabled
                ? "Conecte o WhatsApp para enviar mensagens"
                : isSending
                ? "Enviando mensagem..."
                : placeholder
            }
            className="w-full bg-transparent border-none outline-none text-[13.5px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none max-h-28 overflow-y-auto"
          />
        </div>

        {/* Botão de Envio / Microfone */}
        <button
          type="submit"
          disabled={!value.trim() || disabled || isSending}
          aria-label={value.trim() ? "Enviar mensagem" : "Digitar mensagem"}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm
            ${value.trim() && !disabled
              ? 'bg-[#00a884] hover:bg-[#008f6f] text-white active:scale-95'
              : 'bg-[var(--sidebar-bg)] text-[var(--text-muted)] border border-[var(--border-light)] cursor-not-allowed'
            }
          `}
          title={value.trim() ? "Enviar mensagem (Enter)" : "Digite para enviar"}
          aria-label="Enviar mensagem"
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin text-white" />
          ) : (
            <Send size={18} className={value.trim() ? "ml-0.5" : ""} />
          )}
        </button>

      </form>

    </div>
  );
}
