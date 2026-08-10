import React, { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext';
import QRConnection from './components/QRConnection';
import CRMInterface from './components/CRMInterface';

// Gera ou recupera um token aleatório persistente para a rota do QR
function getOrCreateQRToken() {
  let token = localStorage.getItem('qr_link_token');
  if (!token) {
    // Gera token de 10 chars alfanumérico aleatório (aparência de URL encurtada)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    token = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    localStorage.setItem('qr_link_token', token);
  }
  return token;
}

export const QR_TOKEN = getOrCreateQRToken();

export default function App() {
  const { whatsappStatus } = useSocket();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Rota do QR: /c/<token> — link quase aleatório, livre, sem login
  if (currentPath === `/c/${QR_TOKEN}`) {
    return <QRConnection />;
  }

  // Caminho padrão (CRM principal)
  return (
    <CRMInterface
      onGoToConnect={() => navigateTo(`/c/${QR_TOKEN}`)}
      qrToken={QR_TOKEN}
    />
  );
}
