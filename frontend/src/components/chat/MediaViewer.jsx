// frontend/src/components/chat/MediaViewer.jsx
// Visualizador de Imagens, Documentos e Áudios Reais (PROMPT 04 - ETAPA 08)

import React, { useState } from 'react';
import { Download, X, FileText, Image as ImageIcon, ExternalLink, AlertCircle } from 'lucide-react';
import VoiceNotePlayer from './VoiceNotePlayer';

export default function MediaViewer({
  message,
  backendUrl = '',
  isMe = false
}) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [loadError, setLoadError] = useState(false);

  if (!message?.mediaUrl) return null;

  const rawUrl = message.mediaUrl;
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${backendUrl}${rawUrl}`;

  // 1. ÁUDIO / MENSAGEM DE VOZ
  const isAudio = 
    rawUrl.endsWith('.ogg') || 
    rawUrl.endsWith('.mp3') || 
    rawUrl.endsWith('.wav') || 
    rawUrl.endsWith('.m4a') || 
    message.text?.toLowerCase().includes('áudio') ||
    message.text?.toLowerCase().includes('audio');

  if (isAudio) {
    return <VoiceNotePlayer mediaUrl={rawUrl} backendUrl={backendUrl} isMe={isMe} />;
  }

  // 2. DOCUMENTO (PDF, DOC, PLANILHAS)
  const isDoc = 
    rawUrl.endsWith('.pdf') || 
    rawUrl.endsWith('.doc') || 
    rawUrl.endsWith('.docx') || 
    rawUrl.endsWith('.xls') || 
    rawUrl.endsWith('.xlsx') || 
    rawUrl.endsWith('.txt');

  if (isDoc) {
    const fileName = message.text || rawUrl.split('/').pop() || 'Documento';
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 my-1 bg-[var(--sidebar-bg)] border border-[var(--border-light)] rounded-xl min-w-[220px] select-none">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
            {fileName}
          </span>
        </div>
        <a
          href={fullUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-[var(--active-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          title="Baixar documento"
        >
          <Download size={16} />
        </a>
      </div>
    );
  }

  // 3. IMAGEM (FOTO / PREVIEW)
  if (loadError) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-[var(--text-muted)] bg-[var(--header-bg)] rounded-xl my-1">
        <AlertCircle size={15} />
        <span>Imagem indisponível</span>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => setShowLightbox(true)}
        className="my-1 rounded-xl overflow-hidden cursor-pointer relative group max-w-sm border border-[var(--border-light)]/60 shadow-xs"
        title="Clique para ampliar a imagem"
      >
        <img
          src={fullUrl}
          alt={message.text || "Foto do WhatsApp"}
          className="w-full max-h-72 object-cover transition-transform group-hover:scale-[1.02] duration-200"
          onError={() => setLoadError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-black/50 text-white transition-opacity">
            <ExternalLink size={16} />
          </span>
        </div>
      </div>

      {/* Lightbox Modal de Visualização em Tela Cheia */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none">
          {/* Barra Superior */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <a
              href={fullUrl}
              download="whatsapp-imagem.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Baixar imagem original"
            >
              <Download size={20} />
            </a>
            <button
              onClick={() => setShowLightbox(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Fechar (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Imagem Ampliada */}
          <img
            src={fullUrl}
            alt="Imagem ampliada"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          {message.text && (
            <p className="mt-3 text-xs text-white/90 max-w-xl text-center bg-black/40 px-4 py-1.5 rounded-full">
              {message.text}
            </p>
          )}
        </div>
      )}
    </>
  );
}
