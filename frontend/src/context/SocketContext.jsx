import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
