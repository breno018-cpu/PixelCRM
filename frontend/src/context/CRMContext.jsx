import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const CRMContext = createContext(null);

/**
 * Utilitário para requisições autenticadas com JWT no CRM
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('crm_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    console.warn('[Auth] Requisição não autorizada (401). Sessão expirada.');
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    sessionStorage.removeItem('crm_session');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  return response;
};

export const CRMProvider = ({ children }) => {
  const { socket, backendUrl } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFunnelStage, setFilterFunnelStage] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStoreId, setFilterStoreId] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [archivedView, setArchivedView] = useState(false); // true = mostra arquivados, false = mostra normais
  
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [syncProgresses, setSyncProgresses] = useState({});
  // Rastreia por chatId se ainda pode haver mensagens mais antigas no WhatsApp
  // true = pode ter mais | false = chegou ao início da conversa
  const [hasMoreMap, setHasMoreMap] = useState({});

  // Métricas do Dashboard Real (Fase 07)
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);

  // Regras de Automação Reais (Fase 08)
  const [automations, setAutomations] = useState([]);
  const [loadingAutomations, setLoadingAutomations] = useState(false);

  // Copiloto de IA Real (Fase 09)
  const [aiConfig, setAiConfig] = useState(null);
  const [loadingAiConfig, setLoadingAiConfig] = useState(false);

  // Dark Mode com Persistência em localStorage (Etapa 16)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shineray_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('shineray_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('shineray_theme', 'light');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Busca a lista de chats da API
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterFunnelStage) params.append('funnelStage', filterFunnelStage);
      if (filterTag) params.append('tag', filterTag);
      if (filterStoreId) params.append('storeId', filterStoreId);
      if (filterUserId) params.append('assignedUserId', filterUserId);
      if (archivedView) {
        params.append('archived', 'true');
      } else {
        params.append('archived', 'false');
      }

      const response = await authFetch(`${backendUrl}/api/chats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('[CRM] Erro ao buscar chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [backendUrl, searchQuery, filterFunnelStage, filterTag, filterStoreId, filterUserId, archivedView]);

  // Busca o histórico de mensagens de um chat
  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const response = await authFetch(`${backendUrl}/api/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        // Suporta tanto o formato antigo (array) quanto o novo ({messages, total})
        const msgs = Array.isArray(data) ? data : (data.messages || []);
        const total = Array.isArray(data) ? data.length : (data.total || 0);
        setMessages(msgs);
        // Se há mensagens, assume que pode ter mais no WhatsApp (otimista)
        // Muda para false apenas quando load-history confirmar que acabou
        setHasMoreMap(prev => ({ ...prev, [chatId]: total > 0 }));
        
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
    if (!activeChat) return null;

    const response = await authFetch(`${backendUrl}/api/chats/${activeChat.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha ao enviar mensagem pelo WhatsApp.');
    }

    const savedMsg = await response.json();
    return savedMsg;
  };

  // Atualiza as notas, estágio de funil e tags no banco de dados
  const updateCRMInfo = async (chatId, crmData) => {
    try {
      const response = await authFetch(`${backendUrl}/api/chats/${chatId}/crm`, {
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
      const response = await authFetch(`${backendUrl}/api/chats/${chatId}/archive`, {
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
    setLoadingMoreMessages(true);
    try {
      const response = await authFetch(`${backendUrl}/api/chats/${chatId}/load-history`, {
        method: 'POST'
      });
      const data = await response.json();
      // O backend agora retorna { hasMore } indicando se há mais histórico
      if (data.hasMore === false) {
        // Chegou ao início da conversa — não há mais mensagens para carregar
        setHasMoreMap(prev => ({ ...prev, [chatId]: false }));
      }
      // Se hasMore === true, o histórico chegará via socket (history:synced)
    } catch (e) {
      console.error('[CRM] Erro ao carregar histórico anterior:', e);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Busca a lista de filiais/lojas
  const fetchStores = useCallback(async () => {
    try {
      const response = await authFetch(`${backendUrl}/api/stores`);
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (e) {
      console.error('[CRM] Erro ao buscar filiais:', e);
    }
  }, [backendUrl]);

  // Busca a lista de usuários/atendentes
  const fetchUsers = useCallback(async () => {
    try {
      const response = await authFetch(`${backendUrl}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('[CRM] Erro ao buscar usuários:', e);
    }
  }, [backendUrl]);

  // Carrega filiais e usuários ao montar
  useEffect(() => {
    fetchStores();
    fetchUsers();
  }, [fetchStores, fetchUsers]);

  // Criar nova filial
  const createStore = async (storeData) => {
    try {
      const response = await authFetch(`${backendUrl}/api/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData)
      });
      if (response.ok) {
        const created = await response.json();
        setStores(prev => [...prev, created]);
        return { success: true, store: created };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Atualizar filial
  const updateStore = async (id, storeData) => {
    try {
      const response = await authFetch(`${backendUrl}/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData)
      });
      if (response.ok) {
        const updated = await response.json();
        setStores(prev => prev.map(s => s.id === id ? updated : s));
        return { success: true, store: updated };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Deletar filial
  const deleteStore = async (id) => {
    try {
      const response = await authFetch(`${backendUrl}/api/stores/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setStores(prev => prev.filter(s => s.id !== id));
        return { success: true };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Criar novo atendente / usuário
  const createUser = async (userData) => {
    try {
      const response = await authFetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const created = await response.json();
        setUsers(prev => [...prev, created]);
        return { success: true, user: created };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Atualizar usuário
  const updateUser = async (id, userData) => {
    try {
      const response = await authFetch(`${backendUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const updated = await response.json();
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
        return { success: true, user: updated };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Atribuir conversa a uma filial e/ou atendente
  const assignChat = async (chatId, { storeId, assignedUserId }) => {
    try {
      const response = await authFetch(`${backendUrl}/api/chats/${chatId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, assignedUserId })
      });
      if (response.ok) {
        const updatedChat = await response.json();
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updatedChat } : c));
        if (activeChat && activeChat.id === chatId) {
          setActiveChat(prev => ({ ...prev, ...updatedChat }));
        }
        return { success: true, chat: updatedChat };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      console.error('[CRM] Erro ao atribuir chat:', e);
      return { success: false, error: e.message };
    }
  };

  // Busca métricas consolidadas do dashboard
  const fetchDashboardStats = useCallback(async (filters = {}) => {
    setLoadingDashboardStats(true);
    try {
      const params = new URLSearchParams();
      if (filters.storeId) params.append('storeId', filters.storeId);
      if (filters.assignedUserId) params.append('assignedUserId', filters.assignedUserId);
      const response = await authFetch(`${backendUrl}/api/dashboard/stats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
        return data;
      }
    } catch (e) {
      console.error('[CRM] Erro ao buscar métricas do dashboard:', e);
    } finally {
      setLoadingDashboardStats(false);
    }
  }, [backendUrl]);

  // Busca regras de automação
  const fetchAutomations = useCallback(async () => {
    setLoadingAutomations(true);
    try {
      const response = await authFetch(`${backendUrl}/api/automations`);
      if (response.ok) {
        const data = await response.json();
        setAutomations(data);
        return data;
      }
    } catch (e) {
      console.error('[CRM] Erro ao buscar automações:', e);
    } finally {
      setLoadingAutomations(false);
    }
  }, [backendUrl]);

  // Atualiza regra de automação
  const updateAutomation = async (id, dataToUpdate) => {
    try {
      const response = await authFetch(`${backendUrl}/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });
      if (response.ok) {
        const updated = await response.json();
        setAutomations(prev => prev.map(a => a.id === id ? updated : a));
        return { success: true, automation: updated };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Carrega automações ao montar
  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  // Busca configuração de IA
  const fetchAiConfig = useCallback(async () => {
    setLoadingAiConfig(true);
    try {
      const response = await authFetch(`${backendUrl}/api/ai/config`);
      if (response.ok) {
        const data = await response.json();
        setAiConfig(data);
        return data;
      }
    } catch (e) {
      console.error('[CRM] Erro ao buscar configuração de IA:', e);
    } finally {
      setLoadingAiConfig(false);
    }
  }, [backendUrl]);

  // Atualiza configuração de IA
  const updateAiConfig = async (dataToUpdate) => {
    try {
      const response = await authFetch(`${backendUrl}/api/ai/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });
      if (response.ok) {
        const updated = await response.json();
        setAiConfig(updated);
        return { success: true, config: updated };
      }
      const err = await response.json();
      return { success: false, error: err.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Testa conexão com IA
  const testAiConnection = async (dataToTest) => {
    try {
      const response = await authFetch(`${backendUrl}/api/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToTest)
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message, response: data.response };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Solicita sugestão do Copiloto IA para o chat
  const requestAiSuggestion = async ({ chatId, mode, draftText }) => {
    try {
      const response = await authFetch(`${backendUrl}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, mode, draftText })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, suggestion: data.suggestion, mode: data.mode, model: data.model };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Carrega configuração de IA ao montar
  useEffect(() => {
    fetchAiConfig();
  }, [fetchAiConfig]);

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
      filterStoreId,
      setFilterStoreId,
      filterUserId,
      setFilterUserId,
      stores,
      users,
      automations,
      loadingAutomations,
      fetchAutomations,
      updateAutomation,
      aiConfig,
      loadingAiConfig,
      fetchAiConfig,
      updateAiConfig,
      testAiConnection,
      requestAiSuggestion,
      dashboardStats,
      loadingDashboardStats,
      fetchDashboardStats,
      fetchStores,
      fetchUsers,
      createStore,
      updateStore,
      deleteStore,
      createUser,
      updateUser,
      assignChat,
      archivedView,
      setArchivedView,
      loadingChats,
      loadingMessages,
      loadingMoreMessages,
      syncProgresses,
      // true = pode ter mais mensagens no WhatsApp | false = início da conversa atingido
      hasMoreMessages: activeChat ? (hasMoreMap[activeChat.id] ?? true) : false,
      selectChat,
      sendChatMessage,
      updateCRMInfo,
      archiveChat,
      loadMoreMessages,
      refreshChats: fetchChats,
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode
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
