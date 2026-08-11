import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  const storedUrl = localStorage.getItem('custom_backend_url');
  if (storedUrl) {
    return storedUrl;
  }

  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.startsWith('192.168.') || 
                  hostname.startsWith('10.') || 
                  hostname.startsWith('172.') || 
                  hostname.endsWith('.local');

  if (isLocal) {
    return `${window.location.protocol}//${hostname}:5000`;
  }

  return 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicializa a conexão com o servidor WebSocket
    const socketIo = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('[Socket] Conectado ao servidor.');
      setIsConnected(true);
    });

    socketIo.on('disconnect', () => {
      console.log('[Socket] Desconectado do servidor.');
      setIsConnected(false);
    });

    // Escuta atualizações de status do WhatsApp
    socketIo.on('whatsapp:status', (data) => {
      console.log('[Socket] Status do WhatsApp recebido:', data);
      setWhatsappStatus(data.status);
      setQrCode(data.qrCode);
    });

    // Quando o backend limpa o banco (desconexão forçada ou manual), recarrega a página
    socketIo.on('chats:cleared', () => {
      console.log('[Socket] chats:cleared recebido — recarregando...');
      window.location.reload();
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, whatsappStatus, qrCode, isConnected, backendUrl: BACKEND_URL }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
};
