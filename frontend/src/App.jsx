import React, { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext';
import QRConnection from './components/QRConnection';
import CRMInterface from './components/CRMInterface';

// Gera ou recupera um token aleatório persistente para o link do QR
function getOrCreateQRToken() {
  let token = localStorage.getItem('qr_link_token');
  if (!token) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    token = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    localStorage.setItem('qr_link_token', token);
  }
  return token;
}

export const QR_TOKEN = getOrCreateQRToken();

// Lê o query param ?qr=token da URL atual
function getQRParam() {
  return new URLSearchParams(window.location.search).get('qr');
}

export default function App() {
  const { whatsappStatus } = useSocket();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [qrParam, setQrParam] = useState(getQRParam);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setQrParam(getQRParam());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (url) => {
    window.history.pushState({}, '', url);
    setCurrentPath(window.location.pathname);
    setQrParam(getQRParam());
  };

  // Aceita tanto a rota /c/qualquer-coisa quanto o query-param ?qr=qualquer-coisa
  // Ambos mostram a tela do QR sem exigir login
  if (currentPath.startsWith('/c/') || qrParam) {
    return <QRConnection onReturnToCRM={() => navigateTo('/')} />;
  }

  // Caminho padrão: CRM principal
  return (
    <CRMInterface
      onGoToConnect={() => navigateTo(`/?qr=${QR_TOKEN}`)}
      qrToken={QR_TOKEN}
    />
  );
}
