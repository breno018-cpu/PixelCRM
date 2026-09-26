import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, RefreshCw, QrCode, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

/**
 * ConnectionBanner
 * Monitora o estado de conectividade:
 * 1. Internet local (navigator.onLine)
 * 2. Conexão WebSocket com o Backend (isConnected)
 * 3. Conexão do WhatsApp com a sessão Baileys (whatsappStatus: 'connected' | 'connecting' | 'reconnecting' | 'qr' | 'disconnected' | 'error' | 'syncing')
 */
export default function ConnectionBanner({ onGoToConnect, compact = false }) {
  const { whatsappStatus, isConnected, socket } = useSocket();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Monitora conectividade com a Internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (socket && !socket.connected) {
        socket.connect();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [socket]);

  // Se o status voltar a conectado, reseta dispensado
  useEffect(() => {
    if (isConnected && whatsappStatus === 'connected') {
      setDismissed(false);
    }
  }, [isConnected, whatsappStatus]);

  const handleManualRetry = () => {
    setIsReconnecting(true);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setTimeout(() => {
      setIsReconnecting(false);
    }, 2000);
  };

  // Se tudo estiver 100% conectado e online, não mostra nada
  if (isOnline && isConnected && whatsappStatus === 'connected') {
    return null;
  }

  // Se o usuário dispensou temporariamente um alerta não-crítico
  if (dismissed && isOnline && isConnected) {
    return null;
  }

  // CASO 1: Sem Conexão com a Internet
  if (!isOnline) {
    return (
      <div 
        role="alert" 
        className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
            <WifiOff size={14} />
          </div>
          <div className="truncate">
            <span className="font-bold">Sem conexão com a internet.</span>
            {!compact && (
              <span className="ml-1 opacity-80 hidden sm:inline">
                Verifique sua conexão de rede. As mensagens serão sincronizadas quando restabelecida.
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleManualRetry}
          disabled={isReconnecting}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 text-white font-bold hover:bg-amber-600 active:scale-95 transition-all text-[11px]"
        >
          <RefreshCw size={12} className={isReconnecting ? 'animate-spin' : ''} />
          <span>{isReconnecting ? 'Verificando...' : 'Reconectar'}</span>
        </button>
      </div>
    );
  }

  // CASO 2: Desconectado do Servidor Backend (Socket.io)
  if (!isConnected) {
    return (
      <div 
        role="alert" 
        className="w-full bg-rose-500/15 border-b border-rose-500/30 text-rose-900 dark:text-rose-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
            <AlertCircle size={14} />
          </div>
          <div className="truncate">
            <span className="font-bold">Desconectado do servidor Shineray CRM.</span>
            {!compact && (
              <span className="ml-1 opacity-80 hidden sm:inline">
                Aguardando resposta do servidor local na porta 5000...
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleManualRetry}
          disabled={isReconnecting}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 active:scale-95 transition-all text-[11px]"
        >
          <RefreshCw size={12} className={isReconnecting ? 'animate-spin' : ''} />
          <span>{isReconnecting ? 'Tentando...' : 'Tentar Agora'}</span>
        </button>
      </div>
    );
  }

  // CASO 3: WhatsApp em processo de Conexão ou Reconexão
  if (whatsappStatus === 'connecting' || whatsappStatus === 'reconnecting') {
    return (
      <div 
        role="status" 
        className="w-full bg-sky-500/15 border-b border-sky-500/30 text-sky-900 dark:text-sky-200 px-4 py-2 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
            <RefreshCw size={13} className="animate-spin" />
          </div>
          <div className="truncate">
            <span className="font-bold">Reconectando ao WhatsApp...</span>
            {!compact && (
              <span className="ml-1 opacity-80 hidden sm:inline">
                Estabelecendo sessão criptografada com o aparelho.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CASO 4: WhatsApp Sincronizando Mensagens
  if (whatsappStatus === 'syncing') {
    return (
      <div 
        role="status" 
        className="w-full bg-[var(--brand-primary)]/10 border-b border-[var(--brand-primary)]/30 text-[var(--brand-primary)] px-4 py-2 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center shrink-0">
            <RefreshCw size={13} className="animate-spin text-[var(--brand-primary)]" />
          </div>
          <div className="truncate">
            <span className="font-bold">Sincronizando mensagens...</span>
            {!compact && (
              <span className="ml-1 opacity-80 hidden sm:inline">
                Atualizando histórico recente e contatos com o servidor.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CASO 5: WhatsApp Desconectado / Necessita QR Code
  if (whatsappStatus === 'qr' || whatsappStatus === 'disconnected') {
    return (
      <div 
        role="alert" 
        className="w-full bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
            <QrCode size={14} />
          </div>
          <div className="truncate">
            <span className="font-bold">WhatsApp desconectado.</span>
            {!compact && (
              <span className="ml-1 opacity-85 hidden sm:inline">
                Escaneie o QR Code no seu celular para receber e enviar mensagens em tempo real.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onGoToConnect && (
            <button
              onClick={onGoToConnect}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#00a884] hover:bg-[#008f6f] text-white font-bold transition-all shadow-sm text-[11px] active:scale-95"
            >
              <QrCode size={12} />
              <span>Conectar Aparelho</span>
              <ChevronRight size={12} />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-amber-700/60 dark:text-amber-300/60 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-500/20 transition-colors"
            title="Dispensar aviso por agora"
            aria-label="Dispensar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // CASO 6: Erro de Sessão ou Desconexão Inesperada
  if (whatsappStatus === 'error') {
    return (
      <div 
        role="alert" 
        className="w-full bg-rose-500/15 border-b border-rose-500/30 text-rose-900 dark:text-rose-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
            <AlertCircle size={14} />
          </div>
          <div className="truncate">
            <span className="font-bold">Erro na sessão do WhatsApp.</span>
            {!compact && (
              <span className="ml-1 opacity-80 hidden sm:inline">
                A conexão foi encerrada pelo celular ou expirou. Por favor, conecte novamente.
              </span>
            )}
          </div>
        </div>
        {onGoToConnect && (
          <button
            onClick={onGoToConnect}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 active:scale-95 transition-all text-[11px]"
          >
            <QrCode size={12} />
            <span>Reconectar</span>
          </button>
        )}
      </div>
    );
  }

  return null;
}
