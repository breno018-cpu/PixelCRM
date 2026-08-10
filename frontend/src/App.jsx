import React, { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext';
import QRConnection from './components/QRConnection';
import CRMInterface from './components/CRMInterface';

export default function App() {
  const { whatsappStatus } = useSocket();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Monitora alterações na URL para roteamento simples
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Se o caminho for /conectar, exibe a tela do QR Code dedicada e isolada
  if (currentPath === '/conectar') {
    return (
      <QRConnection />
    );
  }

  // Caminho padrão (CRM principal)
  return (
    <CRMInterface 
      onGoToConnect={() => navigateTo('/conectar')} 
    />
  );
}
