import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { 
  CheckCircle2, 
  Loader2, 
  LogOut, 
  ShieldCheck, 
  MessageSquare, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  ArrowRight,
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * QRCodeScreen
 * Tela moderna e completa de conexão e pareamento WhatsApp,
 * inspirada no WhatsApp Web, com design tokens do Shineray PixelCRM e Dark Mode.
 */
export function QRCodeScreen({ onReturnToCRM }) {
  const { whatsappStatus, qrCode, isConnected, backendUrl, socket } = useSocket();
  const [showConfig, setShowConfig] = useState(false);
  const [configUrl, setConfigUrl] = useState(backendUrl || 'http://localhost:5000');
  const [qrSecondsLeft, setQrSecondsLeft] = useState(60);
  const [qrExpired, setQrExpired] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Timer visual para renovação do QR Code (o Baileys normalmente renova em ~60s)
  useEffect(() => {
    if (whatsappStatus === 'qr' && qrCode) {
      setQrSecondsLeft(60);
      setQrExpired(false);

      const interval = setInterval(() => {
        setQrSecondsLeft((prev) => {
          if (prev <= 1) {
            setQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrCode, whatsappStatus]);

  const handleRefreshQR = () => {
    setQrExpired(false);
    setQrSecondsLeft(60);
    if (socket) {
      socket.emit('whatsapp:restart');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar esta sessão do WhatsApp?')) return;
    try {
      setIsLoggingOut(true);
      await fetch(`${backendUrl}/api/logout`, { method: 'POST' });
    } catch (e) {
      console.error('Erro ao desconectar:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!configUrl.trim()) return;
    localStorage.setItem('custom_backend_url', configUrl.trim());
    window.location.reload();
  };

  const handleResetConfig = () => {
    localStorage.removeItem('custom_backend_url');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app,#f0f2f5)] flex flex-col justify-between text-[var(--text-primary,#111b21)] select-none font-sans transition-colors duration-200">
      
      {/* Top Banner Verde WhatsApp / Shineray */}
      <header className="h-[200px] sm:h-[220px] bg-[#00a884] shrink-0 w-full relative z-0 transition-colors">
        <div className="max-w-[1020px] mx-auto px-4 sm:px-6 h-[72px] sm:h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <MessageSquare size={20} className="text-white fill-white/20" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-wide block leading-none">
                Shineray PixelCRM
              </span>
              <span className="text-[11px] text-white/80 font-medium">
                Conexão WhatsApp Web
              </span>
            </div>
          </div>

          {onReturnToCRM && (
            <button
              onClick={onReturnToCRM}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <span>Voltar ao CRM</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container Sobreposto */}
      <main className="flex-1 max-w-[1020px] w-full mx-auto px-4 sm:px-6 z-10 -mt-[128px] sm:-mt-[140px] mb-8 flex items-center justify-center">
        
        {/* Pairing Card */}
        <div className="w-full bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-xl shadow-xl p-6 sm:p-10 md:p-12 min-h-[460px] flex flex-col justify-between transition-colors">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
            
            {/* Coluna Esquerda: Instruções de Uso */}
            <div className="md:col-span-3 space-y-6">
              
              {whatsappStatus === 'connected' ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="inline-flex p-4 rounded-2xl bg-[#00a884]/10 border border-[#00a884]/20 text-[#00a884]">
                    <CheckCircle2 size={44} className="animate-bounce" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary,#111b21)] leading-tight">
                    Dispositivo Conectado!
                  </h1>
                  <p className="text-sm text-[var(--text-secondary,#667781)] leading-relaxed max-w-md">
                    O seu WhatsApp foi emparelhado com sucesso. O histórico de conversas, mensagens e mídias estão sincronizados em tempo real com a concessionária Shineray.
                  </p>

                  <div className="pt-4 flex flex-wrap gap-3">
                    {onReturnToCRM && (
                      <button
                        onClick={onReturnToCRM}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00a884] hover:bg-[#008f6f] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        <MessageSquare size={16} />
                        <span>Abrir Painel de Atendimento</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary,#111b21)] leading-tight">
                      Use o WhatsApp no PixelCRM
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary,#667781)] mt-1.5">
                      Sincronize o atendimento dos clientes e leads Shineray diretamente pelo navegador.
                    </p>
                  </div>
                  
                  <ol className="space-y-4 text-xs sm:text-sm text-[var(--text-primary,#3b4a54)]">
                    <li className="flex gap-3.5 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] font-bold text-xs shrink-0 mt-0.5 border border-[var(--border-subtle,#e9edef)]">
                        1
                      </span>
                      <span className="pt-0.5">
                        Abra o <strong>WhatsApp</strong> no seu celular.
                      </span>
                    </li>
                    <li className="flex gap-3.5 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] font-bold text-xs shrink-0 mt-0.5 border border-[var(--border-subtle,#e9edef)]">
                        2
                      </span>
                      <span className="pt-0.5">
                        Toque em <strong>Mais opções</strong> <span className="inline-block px-1.5 py-0.2 bg-[var(--active-bg,#f0f2f5)] rounded border border-[var(--border-subtle,#e9edef)] text-[10px]">⋮</span> ou <strong>Configurações</strong> <span className="inline-block px-1.5 py-0.2 bg-[var(--active-bg,#f0f2f5)] rounded border border-[var(--border-subtle,#e9edef)] text-[10px]">⚙️</span> e selecione <strong>Aparelhos Conectados</strong>.
                      </span>
                    </li>
                    <li className="flex gap-3.5 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] font-bold text-xs shrink-0 mt-0.5 border border-[var(--border-subtle,#e9edef)]">
                        3
                      </span>
                      <span className="pt-0.5">
                        Toque no botão <strong>Conectar um aparelho</strong>.
                      </span>
                    </li>
                    <li className="flex gap-3.5 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--active-bg,#f0f2f5)] text-[var(--text-secondary,#667781)] font-bold text-xs shrink-0 mt-0.5 border border-[var(--border-subtle,#e9edef)]">
                        4
                      </span>
                      <span className="pt-0.5">
                        Aponte a câmera do seu celular para esta tela para capturar o código QR ao lado.
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Coluna Direita: Box do QR Code */}
            <div className="md:col-span-2 flex flex-col items-center justify-center">
              
              <div className="w-[280px] h-[280px] bg-[var(--active-bg,#f8f9fa)] border border-[var(--border-subtle,#e9edef)] rounded-2xl shadow-inner flex flex-col items-center justify-center relative p-6 transition-colors">
                
                {/* 1. Servidor Desconectado */}
                {!isConnected && (
                  <div className="text-center flex flex-col items-center animate-fade-in p-4">
                    <WifiOff size={40} className="text-rose-500 mb-3 animate-pulse" />
                    <p className="text-sm font-bold text-[var(--text-primary,#111b21)]">Sem conexão com o servidor</p>
                    <p className="text-[11px] text-[var(--text-secondary,#667781)] mt-1">Tentando restabelecer link local...</p>
                  </div>
                )}

                {/* 2. Conectando Socket / Iniciando Sessão */}
                {isConnected && whatsappStatus === 'connecting' && (
                  <div className="text-center flex flex-col items-center animate-fade-in p-4">
                    <Loader2 size={40} className="text-[#00a884] animate-spin mb-3" />
                    <p className="text-sm font-bold text-[var(--text-primary,#111b21)]">Iniciando sessão...</p>
                    <p className="text-[11px] text-[var(--text-secondary,#667781)] mt-1">Carregando autenticação Baileys</p>
                  </div>
                )}

                {/* 3. Exibição do QR Code */}
                {isConnected && whatsappStatus === 'qr' && (
                  <div className="flex flex-col items-center animate-fade-in relative">
                    {qrCode ? (
                      <div className="bg-white p-3 rounded-xl relative shadow-md border border-[var(--border-subtle,#e9edef)] group">
                        <img 
                          src={qrCode} 
                          alt="QR Code do WhatsApp" 
                          className={`w-[200px] h-[200px] select-none rounded transition-all duration-300 ${
                            qrExpired ? 'filter blur-sm opacity-30' : ''
                          }`} 
                        />

                        {/* Logotipo Central */}
                        {!qrExpired && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                            <div className="w-7 h-7 bg-[#00a884] rounded-md flex items-center justify-center text-white">
                              <MessageSquare size={16} className="fill-white text-white" />
                            </div>
                          </div>
                        )}

                        {/* Overlay quando o QR Code expira */}
                        {qrExpired && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/40 rounded-xl backdrop-blur-xs">
                            <RefreshCw size={28} className="text-white mb-2" />
                            <p className="text-xs font-bold text-white mb-2 leading-tight">
                              Código QR expirado
                            </p>
                            <button
                              onClick={handleRefreshQR}
                              className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-lg text-[11px] font-bold shadow-md transition-all active:scale-95"
                            >
                              Clique para atualizar
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-4">
                        <Loader2 size={36} className="text-[#00a884] animate-spin mb-2" />
                        <span className="text-xs text-[var(--text-secondary,#667781)]">Gerando QR Code...</span>
                      </div>
                    )}

                    {/* Timer de expiração */}
                    {qrCode && !qrExpired && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary,#667781)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                        <span>Atualiza em {qrSecondsLeft}s</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Conectado */}
                {isConnected && whatsappStatus === 'connected' && (
                  <div className="text-center flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 flex items-center justify-center text-[#00a884] mb-3">
                      <CheckCircle2 size={36} />
                    </div>
                    <p className="text-sm text-[#00a884] font-bold">Conexão Ativa</p>
                    <p className="text-[11px] text-[var(--text-secondary,#667781)] mt-0.5">Sessão validada com sucesso</p>
                  </div>
                )}
              </div>

              {/* Botões de Ação sob o Box do QR Code */}
              <div className="mt-6 w-full max-w-[280px] space-y-3">
                {whatsappStatus === 'connected' ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    title="Desconectar Celular e Encerrar Sessão"
                  >
                    <LogOut size={14} className={isLoggingOut ? 'animate-spin' : ''} />
                    <span>{isLoggingOut ? 'Desconectando...' : 'Desconectar Dispositivo'}</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center text-[11px] text-[var(--text-secondary,#667781)] flex items-center justify-center gap-1.5 bg-[var(--active-bg,#f0f2f5)] border border-[var(--border-subtle,#e9edef)] py-2 rounded-lg px-2">
                      <Lock size={12} className="text-[#00a884] shrink-0" />
                      <span>Criptografia de ponta a ponta ativa.</span>
                    </div>

                    {/* Toggle de Configurações Avançadas */}
                    <div className="text-center">
                      <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="text-[11px] text-[var(--text-secondary,#667781)] hover:text-[#00a884] inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Settings size={12} />
                        <span>{showConfig ? 'Ocultar Configurações' : 'Configurações de Rede'}</span>
                        {showConfig ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {/* Formulário de Configuração de IP/Porta */}
                    {showConfig && (
                      <form onSubmit={handleSaveConfig} className="bg-[var(--active-bg,#f0f2f5)] p-3 rounded-xl border border-[var(--border-subtle,#e9edef)] space-y-2 animate-fade-in text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary,#667781)] uppercase tracking-wider block">
                            Servidor Backend
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="http://localhost:5000"
                            value={configUrl}
                            onChange={(e) => setConfigUrl(e.target.value)}
                            className="w-full bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary,#111b21)] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-[11px] rounded-lg transition-colors text-center shadow-xs"
                          >
                            Salvar
                          </button>
                          {localStorage.getItem('custom_backend_url') && (
                            <button
                              type="button"
                              onClick={handleResetConfig}
                              className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-[11px] rounded-lg transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Rodapé do Cartão */}
          <div className="border-t border-[var(--border-subtle,#e9edef)] pt-5 mt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[var(--text-secondary,#667781)] gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#00a884]" />
              <span>Conexão Segura Shineray Motors &copy; 2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00a884]' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'Servidor Online' : 'Servidor Offline'}</span>
            </span>
          </div>

        </div>
      </main>

      {/* Footer da Página */}
      <footer className="h-[50px] bg-[var(--bg-app,#eae6df)] border-t border-[var(--border-subtle,#e9edef)] flex items-center justify-center text-[11px] text-[var(--text-secondary,#667781)]">
        <span>PixelCRM &bull; Módulo WhatsApp Web</span>
      </footer>

    </div>
  );
}

/**
 * OfflineScreen
 * Tela dedicada para quando a aplicação não consegue comunicar com o servidor.
 */
export function OfflineScreen({ onRetry }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app,#f0f2f5)] flex items-center justify-center p-4 text-[var(--text-primary,#111b21)] font-sans">
      <div className="max-w-md w-full bg-[var(--bg-panel,#ffffff)] border border-[var(--border-subtle,#e9edef)] rounded-2xl shadow-xl p-8 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto">
          <WifiOff size={32} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary,#111b21)]">
            Sem Comunicação com o Servidor
          </h2>
          <p className="text-xs text-[var(--text-secondary,#667781)] mt-2 leading-relaxed">
            Não foi possível estabelecer contato com a API do PixelCRM na porta 5000. Verifique se o servidor backend está em execução.
          </p>
        </div>

        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full py-2.5 rounded-lg bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Tentar Novamente</span>
        </button>
      </div>
    </div>
  );
}

export default QRCodeScreen;
