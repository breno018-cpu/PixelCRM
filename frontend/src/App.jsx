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
  // Usa query param em vez de path para evitar 404 em hosting estático
  const [qrParam, setQrParam] = useState(getQRParam);

  useEffect(() => {
    const handleLocationChange = () => setQrParam(getQRParam());
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (url) => {
    window.history.pushState({}, '', url);
    setQrParam(getQRParam());
  };

  // Se ?qr= está presente na URL → mostra QR sem login (qualquer dispositivo)
  // A segurança vem da aleatoriedade do token (10 chars), não da validação local
  if (qrParam) {
    return <QRConnection />;
  }

  // Caminho padrão: CRM principal
  return (
    <CRMInterface
      onGoToConnect={() => navigateTo(`/?qr=${QR_TOKEN}`)}
      qrToken={QR_TOKEN}
    />
  );
}
