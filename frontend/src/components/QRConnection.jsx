import React from 'react';
import { useSocket } from '../context/SocketContext';
import { CheckCircle2, Loader2, LogOut, ShieldCheck, MessageSquare } from 'lucide-react';

export default function QRConnection() {
  const { whatsappStatus, qrCode, isConnected, backendUrl } = useSocket();

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/api/logout`, { method: 'POST' });
    } catch (e) {
      console.error('Erro ao desconectar:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#eae6df] flex flex-col justify-between text-[#111b21] select-none font-sans">
      
      {/* Top Banner (WhatsApp Web style Green Bar) */}
      <header className="h-[220px] bg-[#00a884] shrink-0 w-full relative z-0">
        <div className="max-w-[1000px] mx-auto px-6 h-[80px] flex items-center gap-3">
          {/* Logo PixelLoom customizada do projeto em tamanho pequeno */}
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="qrLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00a884" />
                  <stop offset="100%" stopColor="#53bdeb" />
                </linearGradient>
                <linearGradient id="qrLogoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#00a884" />
                </linearGradient>
              </defs>
              <rect x="26" y="15" width="7" height="70" rx="3.5" fill="url(#qrLogoGrad1)" />
              <rect x="46.5" y="15" width="7" height="70" rx="3.5" fill="url(#qrLogoGrad1)" />
              <rect x="67" y="15" width="7" height="70" rx="3.5" fill="url(#qrLogoGrad1)" />
              <rect x="15" y="26" width="70" height="7" rx="3.5" fill="url(#qrLogoGrad2)" />
              <rect x="15" y="46.5" width="70" height="7" rx="3.5" fill="url(#qrLogoGrad2)" />
              <rect x="15" y="67" width="70" height="7" rx="3.5" fill="url(#qrLogoGrad2)" />
            </svg>
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-white">PixelLoom Web</span>
        </div>
      </header>

      {/* Main Container Overlaying the Green Bar */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 z-10 -mt-[140px] mb-12 flex items-center justify-center">
        
        {/* Pairing Card (WhatsApp Web layout) */}
        <div className="w-full bg-white border border-[#e9edef] rounded-lg shadow-2xl p-12 min-h-[460px] flex flex-col justify-between">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            
            {/* Left Column: Instructions */}
            <div className="md:col-span-3 space-y-6">
              
              {whatsappStatus === 'connected' ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="inline-flex p-4 rounded-full bg-[#00a884]/10 border border-[#00a884]/20 text-[#00a884]">
                    <CheckCircle2 size={44} className="animate-bounce" />
                  </div>
                  <h1 className="text-2xl font-normal text-[#111b21] leading-normal">
                    Dispositivo Conectado!
                  </h1>
                  <p className="text-sm text-[#667781] leading-relaxed max-w-md">
                    O seu WhatsApp Business foi emparelhado com sucesso. As conversas e o histórico de mensagens estão sincronizados de forma segura no dispositivo.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <h1 className="text-2xl font-light text-[#111b21] leading-normal">
                    Use o WhatsApp no seu computador
                  </h1>
                  
                  <ol className="space-y-5 text-sm text-[#3b4a54]">
                    <li className="flex gap-4 items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#f0f2f5] text-[#667781] font-semibold text-[11px] shrink-0 mt-0.5 border border-[#e9edef]">1</span>
                      <span>Abra o <strong>WhatsApp</strong> no seu celular.</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#f0f2f5] text-[#667781] font-semibold text-[11px] shrink-0 mt-0.5 border border-[#e9edef]">2</span>
                      <span>Toque em <strong>Mais opções</strong> <span className="text-[10px] bg-[#f0f2f5] px-1 py-0.5 rounded border border-[#e9edef]">⋮</span> ou <strong>Configurações</strong> <span className="text-[10px] bg-[#f0f2f5] px-1 py-0.5 rounded border border-[#e9edef]">⚙️</span> e selecione <strong>Aparelhos Conectados</strong>.</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#f0f2f5] text-[#667781] font-semibold text-[11px] shrink-0 mt-0.5 border border-[#e9edef]">3</span>
                      <span>Toque em <strong>Conectar um aparelho</strong>.</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#f0f2f5] text-[#667781] font-semibold text-[11px] shrink-0 mt-0.5 border border-[#e9edef]">4</span>
                      <span>Aponte seu celular para esta tela para capturar o código QR ao lado.</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Right Column: QR Code Box */}
            <div className="md:col-span-2 flex flex-col items-center justify-center">
              
              <div className="w-[280px] h-[280px] bg-[#f8f9fa] border border-[#e9edef] rounded-lg shadow-sm flex flex-col items-center justify-center relative p-6 bg-gradient-to-b from-[#f0f2f5]/40 to-[#f0f2f5]">
                
                {!isConnected && (
                  <div className="text-center flex flex-col items-center animate-fade-in p-4">
                    <Loader2 size={36} className="text-[#00a884] animate-spin mb-4" />
                    <p className="text-xs text-[#667781] font-medium">Aguardando rede...</p>
                  </div>
                )}

                {isConnected && whatsappStatus === 'connecting' && (
                  <div className="text-center flex flex-col items-center animate-fade-in p-4">
                    <Loader2 size={36} className="text-[#00a884] animate-spin mb-4" />
                    <p className="text-xs text-[#667781] font-medium">Iniciando conexão...</p>
                  </div>
                )}

                {isConnected && whatsappStatus === 'qr' && (
                  <div className="flex flex-col items-center animate-fade-in">
                    {qrCode ? (
                      <div className="bg-white p-3 rounded-lg relative shadow-md border border-[#e9edef]">
                        <img 
                          src={qrCode} 
                          alt="WhatsApp QR Code" 
                          className="w-[200px] h-[200px] select-none" 
                        />
                        {/* Tiny logo inside the QR code center, WhatsApp style */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md border border-slate-100 shadow-sm flex items-center justify-center">
                          <div className="w-7 h-7 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                            <MessageSquare size={14} className="fill-white text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Loader2 size={32} className="text-[#00a884] animate-spin" />
                    )}
                  </div>
                )}

                {isConnected && whatsappStatus === 'connected' && (
                  <div className="text-center flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-[#00a884]/10 border border-[#00a884]/20 flex items-center justify-center text-[#00a884] mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-xs text-[#00a884] font-bold">Conectado com Sucesso</p>
                  </div>
                )}
              </div>

              {/* Action Buttons under QR Code */}
              <div className="mt-6 w-full max-w-[280px]">
                {whatsappStatus === 'connected' ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-[#00a884]/10 border border-[#00a884]/20 rounded-lg text-center text-xs text-[#00a884] font-semibold">
                      Dispositivo Pareado
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      title="Desconectar Celular"
                    >
                      <LogOut size={13} />
                      Desconectar Dispositivo
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-[11px] text-[#667781] flex items-center justify-center gap-1.5 bg-[#f0f2f5] border border-[#e9edef] py-2.5 rounded-lg px-2">
                    <ShieldCheck size={14} className="text-[#00a884] shrink-0" />
                    <span>Criptografia padrão ativa.</span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Footer of pairing card */}
          <div className="border-t border-[#e9edef] pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#667781] gap-3">
            <span>Desenvolvido para PixelLoom &copy; 2026</span>
            <span className="flex items-center gap-1 text-[#00a884]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
              Conexão Ativa
            </span>
          </div>

        </div>
      </main>

      {/* Footer page credits */}
      <footer className="h-[60px] bg-[#eae6df] border-t border-[#e9edef]/60 flex items-center justify-center text-[11px] text-[#667781]">
        <span>PixelLoom Web - Conectar Dispositivo WhatsApp</span>
      </footer>

    </div>
  );
}
