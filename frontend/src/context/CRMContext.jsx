import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const CRMContext = createContext(null);

export const CRMProvider = ({ children }) => {
  const { socket, backendUrl } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFunnelStage, setFilterFunnelStage] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [archivedView, setArchivedView] = useState(false); // true = mostra arquivados, false = mostra normais
  
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [syncProgresses, setSyncProgresses] = useState({});

  // Busca a lista de chats da API
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterFunnelStage) params.append('funnelStage', filterFunnelStage);
      if (filterTag) params.append('tag', filterTag);
      if (archivedView) {
        params.append('archived', 'true');
      } else {
        params.append('archived', 'false');
      }

      const response = await fetch(`${backendUrl}/api/chats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('[CRM] Erro ao buscar chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [backendUrl, searchQuery, filterFunnelStage, filterTag, archivedView]);

  // Busca o histórico de mensagens de um chat
  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`${backendUrl}/api/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Zera o contador de não lidas localmente para este chat
        setChats(prevChats => 
          prevChats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error('[CRM] Erro ao buscar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [backendUrl]);

  // Recarrega os chats sempre que os filtros mudam
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Configura os ouvintes de WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!socket) return;

    // Novo chat criado no backend
    const handleNewChat = (newChat) => {
      setChats(prev => {
        // Evita duplicatas
        if (prev.some(c => c.id === newChat.id)) return prev;
        // Só adiciona se o estado de arquivamento bater com a visualização atual
        if (newChat.isArchived !== archivedView) return prev;
        return [newChat, ...prev];
      });
    };

    // Chat atualizado (última mensagem, unreadCount, crm)
    const handleChatUpdated = (updatedChat) => {
      setChats(prev => {
        // Se a visualização de arquivados não coincide com o estado do chat, removemos da lista atual
        if (updatedChat.isArchived !== archivedView) {
          return prev.filter(c => c.id !== updatedChat.id);
        }

        const filtered = prev.filter(c => c.id !== updatedChat.id);
        // Coloca o chat atualizado no topo
        return [updatedChat, ...filtered].sort((a, b) => {
          return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
        });
      });

      // Se o chat atualizado for o chat ativo, atualiza suas informações
      setActiveChat(prev => {
        if (prev && prev.id === updatedChat.id) {
          return { ...prev, ...updatedChat };
        }
        return prev;
      });
    };

    // Nova mensagem recebida ou enviada
    const handleNewMessage = (newMsg) => {
      // Se a mensagem pertence ao chat ativo, adiciona ao histórico
      setActiveChat(prevActive => {
        if (prevActive && prevActive.id === newMsg.chatId) {
          setMessages(prevMsgs => {
            // Evita duplicatas
            if (prevMsgs.some(m => m.id === newMsg.id)) return prevMsgs;
            return [...prevMsgs, newMsg];
          });
        }
        return prevActive;
      });
    };

    // Atualização de status da mensagem (enviada, entregue, lida)
    const handleMessageStatusUpdated = ({ id, chatId, status }) => {
      setActiveChat(prevActive => {
        if (prevActive && prevActive.id === chatId) {
          setMessages(prevMsgs => 
            prevMsgs.map(m => m.id === id ? { ...m, status: status } : m)
          );
        }
        return prevActive;
      });
    };

    const handleHistorySynced = () => {
      console.log('[CRM] Histórico sincronizado pelo backend, recarregando chats...');
      fetchChats();
      // Recarrega as mensagens do chat aberto para exibir as novas mensagens sincronizadas
      setActiveChat(prev => {
        if (prev) {
          fetchMessages(prev.id);
        }
        return prev;
      });
    };

    const handleHistoryProgress = (progress) => {
      setSyncProgresses(prev => ({
        ...prev,
        [progress.chatId]: progress
      }));
    };

    socket.on('chat:new', handleNewChat);
    socket.on('chat:updated', handleChatUpdated);
    socket.on('message:new', handleNewMessage);
    socket.on('message:status_updated', handleMessageStatusUpdated);
    socket.on('history:synced', handleHistorySynced);
    socket.on('history:progress', handleHistoryProgress);

    return () => {
      socket.off('chat:new', handleNewChat);
      socket.off('chat:updated', handleChatUpdated);
      socket.off('message:new', handleNewMessage);
      socket.off('message:status_updated', handleMessageStatusUpdated);
      socket.off('history:synced', handleHistorySynced);
      socket.off('history:progress', handleHistoryProgress);
    };
  }, [socket, fetchChats, archivedView]);

  // Seleciona um chat e carrega suas mensagens
  const selectChat = useCallback((chat) => {
    setActiveChat(chat);
    if (chat) {
      fetchMessages(chat.id);
    } else {
      setMessages([]);
    }
  }, [fetchMessages]);

  // Envia uma nova mensagem
  const sendChatMessage = async (text) => {
    if (!activeChat) return;

    try {
      const response = await fetch(`${backendUrl}/api/chats/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }

      // A mensagem será recebida via WebSocket e adicionada na lista automaticamente
    } catch (error) {
      console.error('[CRM] Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Certifique-se de que o WhatsApp está conectado.');
    }
  };

  // Atualiza as notas, estágio de funil e tags no banco de dados
  const updateCRMInfo = async (chatId, crmData) => {
    try {
      const response = await fetch(`${backendUrl}/api/chats/${chatId}/crm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(crmData)
      });

      if (response.ok) {
        const updatedChat = await response.json();
        
        // Atualiza os estados locais
        setChats(prev => 
          prev.map(c => c.id === chatId ? { ...c, ...updatedChat } : c)
        );

        if (activeChat && activeChat.id === chatId) {
          setActiveChat(prev => ({ ...prev, ...updatedChat }));
        }
      }
    } catch (error) {
      console.error('[CRM] Erro ao atualizar dados de CRM:', error);
    }
  };

  // Arquivar ou desarquivar uma conversa
  const archiveChat = async (chatId, archive) => {
    try {
      const response = await fetch(`${backendUrl}/api/chats/${chatId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ archive })
      });

      if (response.ok) {
        const updatedChat = await response.json();
        
        // Remove da visualização atual já que mudou o estado de arquivamento
        setChats(prev => prev.filter(c => c.id !== chatId));

        // Se era o chat selecionado, podemos desmarcá-lo ou atualizar
        if (activeChat && activeChat.id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('[CRM] Erro ao arquivar conversa:', error);
    }
  };

  // Solicita carregamento de histórico adicional no WhatsApp
  const loadMoreMessages = async (chatId) => {
    try {
      const response = await fetch(`${backendUrl}/api/chats/${chatId}/load-history`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Falha ao carregar mais histórico');
      }
    } catch (e) {
      console.error('[CRM] Erro ao carregar histórico anterior:', e);
    }
  };

  return (
    <CRMContext.Provider value={{
      chats,
      activeChat,
      messages,
      searchQuery,
      setSearchQuery,
      filterFunnelStage,
      setFilterFunnelStage,
      filterTag,
      setFilterTag,
      archivedView,
      setArchivedView,
      loadingChats,
      loadingMessages,
      syncProgresses,
      selectChat,
      sendChatMessage,
      updateCRMInfo,
      archiveChat,
      loadMoreMessages,
      refreshChats: fetchChats
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM deve ser usado dentro de um CRMProvider');
  }
  return context;
};
