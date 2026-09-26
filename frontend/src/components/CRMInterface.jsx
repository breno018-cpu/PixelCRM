import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';
import { useSocket } from '../context/SocketContext';
import { 
  Search, Send, MessageSquare, Tags, FileText, User, 
  Phone, Calendar, Award, Check, CheckCheck, Loader2, AlertCircle, 
  Edit2, Save, BarChart3, Users, Clock, AlertTriangle, Plus, X,
  Menu, Info, Smile, Paperclip, MoreVertical, XCircle, ChevronRight,
  LogOut, ShieldAlert, MessageCircle, HelpCircle, Archive, FolderArchive,
  FolderOpen, ArrowLeft, Sparkles, Cpu, Bot, Sliders, Play, GitFork, Lock,
  Globe, Database, Key, ShoppingBag, Layers, Percent, FileCheck, FileCode, SendHorizontal, Activity,
  Pause, Mic, Download, ChevronUp, ChevronDown, File,
  Building2, Building, UserCheck, UserPlus, ShieldCheck, MapPin,
  Kanban, LayoutGrid, ArrowRight, Filter, TrendingUp, RefreshCw,
  Copy, Eye, EyeOff, Wand2
} from 'lucide-react';

// LOGO CUSTOMIZADA DA PIXEL LOOM (Intersecção de linhas e tecelagem de pixels)
const PixelLoomLogo = ({ size = 32, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="loomGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00a884" />
        <stop offset="100%" stopColor="#53bdeb" />
      </linearGradient>
      <linearGradient id="loomGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#00a884" />
      </linearGradient>
    </defs>
    
    {/* Malha vertical do tear */}
    <rect x="26" y="15" width="7" height="70" rx="3.5" fill="url(#loomGrad1)" opacity="0.85" />
    <rect x="46.5" y="15" width="7" height="70" rx="3.5" fill="url(#loomGrad1)" />
    <rect x="67" y="15" width="7" height="70" rx="3.5" fill="url(#loomGrad1)" opacity="0.85" />
    
    {/* Malha horizontal do tear (Tecelagem de dados) */}
    <rect x="15" y="26" width="70" height="7" rx="3.5" fill="url(#loomGrad2)" opacity="0.85" />
    <rect x="15" y="46.5" width="70" height="7" rx="3.5" fill="url(#loomGrad2)" />
    <rect x="15" y="67" width="70" height="7" rx="3.5" fill="url(#loomGrad2)" opacity="0.85" />
    
    {/* Pixels centrais de intersecção ativos */}
    <rect x="44" y="44" width="12" height="12" rx="2.5" fill="#ffffff" stroke="#00a884" strokeWidth="2.5" />
    <rect x="23.5" y="23.5" width="12" height="12" rx="2.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
    <rect x="64.5" y="64.5" width="12" height="12" rx="2.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
  </svg>
);

// REPRODUTOR REAL DE MENSAGENS DE VOZ E ÁUDIOS (Estilo WhatsApp)
function VoiceNotePlayer({ mediaUrl, backendUrl, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  const fullUrl = mediaUrl
    ? (mediaUrl.startsWith('http') ? mediaUrl : `${backendUrl}${mediaUrl}`)
    : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [fullUrl]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatAudioTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!fullUrl || hasError) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
        <AlertCircle size={16} className="shrink-0" />
        <span className="text-[11px]">Áudio não disponível ou expirado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 min-w-[240px] max-w-[300px] py-1 select-none">
      <audio ref={audioRef} src={fullUrl} preload="metadata" />

      {/* Botão Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[#00a884] text-white hover:bg-emerald-600 flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95"
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      {/* Trilha de progresso e scrubber */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#e9edef] rounded-lg appearance-none cursor-pointer accent-[#00a884]"
        />
        <div className="flex items-center justify-between text-[10px] text-[#667781] font-mono">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{duration ? formatAudioTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* Velocidade de reprodução */}
      <button
        onClick={togglePlaybackRate}
        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e9edef] hover:bg-[#d1d7db] text-[#54656f] shrink-0 active:scale-95 transition-all"
        title="Velocidade"
      >
        {playbackRate}x
      </button>

      {/* Ícone de microfone característico */}
      <div className="w-8 h-8 rounded-full bg-[#00a884]/15 flex items-center justify-center text-[#00a884] shrink-0">
        <Mic size={15} />
      </div>
    </div>
  );
}

// CARD REAL DE DOCUMENTOS E ANEXOS
function DocumentCard({ msg, backendUrl, isMe }) {
  const fullUrl = msg.mediaUrl
    ? (msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${backendUrl}${msg.mediaUrl}`)
    : null;

  const fileName = msg.text?.replace(/^📄\s*/, '') || 'Documento';

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e9edef] bg-white min-w-[230px] max-w-[290px] shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0">
        <FileText size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#111b21] truncate" title={fileName}>
          {fileName}
        </p>
        <span className="text-[10px] text-[#667781]">Documento Anexo</span>
      </div>

      {fullUrl ? (
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          download={fileName}
          className="p-1.5 rounded-full bg-[#f0f2f5] hover:bg-[#eae6df] text-[#54656f] hover:text-[#111b21] transition-colors shrink-0 shadow-sm"
          title="Baixar Documento"
        >
          <Download size={16} />
        </a>
      ) : (
        <span className="text-[10px] text-amber-600 font-medium shrink-0">Expirado</span>
      )}
    </div>
  );
}

export default function CRMInterface({ onGoToConnect, qrToken }) {
  const { whatsappStatus, isConnected, backendUrl } = useSocket();
  const {
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
    hasMoreMessages,
    selectChat,
    sendChatMessage,
    updateCRMInfo,
    archiveChat,
    loadMoreMessages
  } = useCRM();

  // Autenticação Real com JWT (Fase 01 - Segurança)
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('crm_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('crm_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Gestão de Filiais e Equipe (Fase 05 - Multi-usuário Real)
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamTab, setTeamTab] = useState('stores'); // 'stores' | 'users'
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState({ id: null, name: '', address: '', phone: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ id: null, name: '', email: '', password: '', role: 'OPERATOR', storeId: '', active: true });
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMsg, setTeamMsg] = useState({ type: '', text: '' });

  // Pipeline Comercial Real & Kanban (Fase 06)
  const [draggingChatId, setDraggingChatId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [kanbanStoreFilter, setKanbanStoreFilter] = useState('');
  const [kanbanUserFilter, setKanbanUserFilter] = useState('');

  const handleDropStage = async (chatId, newStage) => {
    if (!chatId || !newStage) return;
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat || targetChat.funnelStage === newStage) return;
    await updateCRMInfo(chatId, { funnelStage: newStage });
  };

  // Dashboard Analítico Real (Fase 07)
  const [dashStoreFilter, setDashStoreFilter] = useState('');
  const [dashUserFilter, setDashUserFilter] = useState('');

  // Central de Automações Reais (Fase 08)
  const [welcomeForm, setWelcomeForm] = useState({ id: null, enabled: false, message: '' });
  const [outOfHoursForm, setOutOfHoursForm] = useState({
    id: null,
    enabled: false,
    message: '',
    startHour: 8,
    endHour: 18,
    workDays: '1,2,3,4,5'
  });
  const [savingAutomationType, setSavingAutomationType] = useState(null);
  const [automationSavedAlert, setAutomationSavedAlert] = useState(null);

  useEffect(() => {
    const welcome = automations.find(a => a.type === 'WELCOME');
    if (welcome) {
      setWelcomeForm({
        id: welcome.id,
        enabled: welcome.enabled,
        message: welcome.message || ''
      });
    }

    const out = automations.find(a => a.type === 'OUT_OF_HOURS');
    if (out) {
      setOutOfHoursForm({
        id: out.id,
        enabled: out.enabled,
        message: out.message || '',
        startHour: out.startHour ?? 8,
        endHour: out.endHour ?? 18,
        workDays: out.workDays || '1,2,3,4,5'
      });
    }
  }, [automations]);

  const handleSaveWelcome = async () => {
    if (!welcomeForm.id) return;
    setSavingAutomationType('WELCOME');
    const res = await updateAutomation(welcomeForm.id, {
      enabled: welcomeForm.enabled,
      message: welcomeForm.message
    });
    setSavingAutomationType(null);
    if (res.success) {
      setAutomationSavedAlert('Mensagem de boas-vindas salva com sucesso!');
      setTimeout(() => setAutomationSavedAlert(null), 3500);
    }
  };

  const handleSaveOutOfHours = async () => {
    if (!outOfHoursForm.id) return;
    setSavingAutomationType('OUT_OF_HOURS');
    const res = await updateAutomation(outOfHoursForm.id, {
      enabled: outOfHoursForm.enabled,
      message: outOfHoursForm.message,
      startHour: parseInt(outOfHoursForm.startHour, 10),
      endHour: parseInt(outOfHoursForm.endHour, 10),
      workDays: outOfHoursForm.workDays
    });
    setSavingAutomationType(null);
    if (res.success) {
      setAutomationSavedAlert('Regra de atendimento fora do horário salva com sucesso!');
      setTimeout(() => setAutomationSavedAlert(null), 3500);
    }
  };

  const toggleWorkDay = (dayNum) => {
    const current = (outOfHoursForm.workDays || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const dayStr = String(dayNum);
    let next;
    if (current.includes(dayStr)) {
      next = current.filter(d => d !== dayStr);
    } else {
      next = [...current, dayStr].sort((a, b) => Number(a) - Number(b));
    }
    setOutOfHoursForm(prev => ({ ...prev, workDays: next.join(',') }));
  };

  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'kanban' | 'dashboard' | 'automations'

  // Efeito para carregar métricas do dashboard
  useEffect(() => {
    if (activeTab === 'dashboard' && isLoggedIn) {
      fetchDashboardStats({
        storeId: dashStoreFilter,
        assignedUserId: dashUserFilter
      });
    }
  }, [activeTab, dashStoreFilter, dashUserFilter, isLoggedIn, fetchDashboardStats]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sendError, setSendError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);
  const [showCrmPanel, setShowCrmPanel] = useState(false); // Controla o painel lateral de CRM/Contato
  const [hoveredChatId, setHoveredChatId] = useState(null);

  // Copiloto de IA Real (Fase 09)
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null); // { text, mode, model }
  const [aiError, setAiError] = useState(null);
  const [aiCopied, setAiCopied] = useState(false);

  // Formulário do Modal de Configuração de IA
  const [aiForm, setAiForm] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash',
    systemPrompt: '',
    temperature: 0.7,
    enabled: false
  });
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [testingAiKey, setTestingAiKey] = useState(false);
  const [testAiResult, setTestAiResult] = useState(null);
  const [savingAiConfig, setSavingAiConfig] = useState(false);
  const [aiSavedSuccess, setAiSavedSuccess] = useState(false);

  useEffect(() => {
    if (aiConfig) {
      setAiForm(prev => ({
        ...prev,
        provider: aiConfig.provider || 'gemini',
        model: aiConfig.model || (aiConfig.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'),
        systemPrompt: aiConfig.systemPrompt || '',
        temperature: aiConfig.temperature ?? 0.7,
        enabled: Boolean(aiConfig.enabled)
      }));
    }
  }, [aiConfig]);

  // Limpa painel de IA ao trocar de chat
  useEffect(() => {
    setAiSuggestion(null);
    setAiError(null);
    setAiPanelOpen(false);
  }, [activeChat?.id]);

  const handleTriggerCopilot = async (mode) => {
    if (!activeChat) return;
    setAiPanelOpen(true);
    setAiGenerating(true);
    setAiError(null);
    setAiSuggestion(null);

    const res = await requestAiSuggestion({
      chatId: activeChat.id,
      mode,
      draftText: mode === 'improve' ? messageInput : ''
    });

    setAiGenerating(false);
    if (res.success) {
      setAiSuggestion({
        text: res.suggestion,
        mode: res.mode,
        model: res.model
      });
    } else {
      setAiError(res.error || 'Erro ao gerar sugestão de IA.');
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion?.text) return;
    setMessageInput(aiSuggestion.text);
    setAiPanelOpen(false);
  };

  const handleCopyAiSuggestion = () => {
    if (!aiSuggestion?.text) return;
    navigator.clipboard.writeText(aiSuggestion.text);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  const handleSaveAiConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingAiConfig(true);
    setTestAiResult(null);

    const payload = {
      provider: aiForm.provider,
      model: aiForm.model,
      systemPrompt: aiForm.systemPrompt,
      temperature: parseFloat(aiForm.temperature) || 0.7,
      enabled: aiForm.enabled
    };
    if (aiForm.apiKey && aiForm.apiKey.trim()) {
      payload.apiKey = aiForm.apiKey.trim();
    }

    const res = await updateAiConfig(payload);
    setSavingAiConfig(false);
    if (res.success) {
      setAiSavedSuccess(true);
      setAiForm(prev => ({ ...prev, apiKey: '' }));
      setTimeout(() => setAiSavedSuccess(false), 3000);
    } else {
      setTestAiResult({ success: false, error: res.error });
    }
  };

  const handleTestAiKey = async () => {
    setTestingAiKey(true);
    setTestAiResult(null);
    const res = await testAiConnection({
      provider: aiForm.provider,
      apiKey: aiForm.apiKey,
      model: aiForm.model
    });
    setTestingAiKey(false);
    setTestAiResult(res);
  };

  // Busca interna dentro do chat ativo (Fase 04)
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  
  // Modais e Popups
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null); // Lightbox URL
  const [showQrLinkPopup, setShowQrLinkPopup] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const qrFullUrl = qrToken ? `${window.location.origin}/?qr=${qrToken}` : '';
  const handleCopyQrLink = () => {
    if (!qrFullUrl) return;
    navigator.clipboard.writeText(qrFullUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Splash Screen e Carregamento PixelLoom (Ultra-Minimalist Style)
  const [isBooted, setIsBooted] = useState(() => !!localStorage.getItem('crm_token'));
  const [bootProgress, setBootProgress] = useState(() => localStorage.getItem('crm_token') ? 100 : 0);

  const messagesEndRef = useRef(null);

  // Efeito do PixelLoom Splash Screen no Boot Inicial (Ultra-Minimalist, roda após fazer login)
  useEffect(() => {
    let interval = null;
    if (isLoggedIn && !isBooted) {
      interval = setInterval(() => {
        setBootProgress((prev) => {
          const next = prev + 5; // Sincroniza em aproximadamente 1.4s (minimalista e rápido)
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsBooted(true);
            }, 300);
            return 100;
          }
          return next;
        });
      }, 70);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, isBooted]);

  // Rolagem automática para a última mensagem do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Atualiza campos locais quando seleciona um contato
  useEffect(() => {
    if (activeChat) {
      setNameInput(activeChat.name || '');
      setNotesInput(activeChat.notes || '');
      setEditingName(false);
    }
  }, [activeChat]);

  // Listener da tecla ESC para fechar o contato selecionado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeChat) {
        selectChat(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeChat, selectChat]);

  // Mensagens correspondentes na busca interna (Fase 04)
  const searchMatches = React.useMemo(() => {
    if (!chatSearchQuery.trim() || !messages.length) return [];
    const q = chatSearchQuery.toLowerCase().trim();
    return messages
      .filter(m => m.text && m.text.toLowerCase().includes(q))
      .map(m => m.id);
  }, [chatSearchQuery, messages]);

  const scrollToMatchedMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const next = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(next);
    scrollToMatchedMessage(searchMatches[next]);
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const next = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(next);
    scrollToMatchedMessage(searchMatches[next]);
  };

  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIdx(0);
      scrollToMatchedMessage(searchMatches[0]);
    }
  }, [chatSearchQuery]);

  // Reseta busca ao trocar de conversa
  useEffect(() => {
    setShowInChatSearch(false);
    setChatSearchQuery('');
    setCurrentMatchIdx(0);
  }, [activeChat?.id]);

  const renderMessageText = (text, isCurrentMatched) => {
    if (!chatSearchQuery.trim() || !text) return text;
    const q = chatSearchQuery.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className={`px-0.5 rounded font-semibold ${isCurrentMatched ? 'bg-amber-400 text-black' : 'bg-yellow-200 text-black'}`}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Escuta expiração de sessão para retornar ao login
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsLoggedIn(false);
      setIsBooted(false);
      setBootProgress(0);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas. Verifique seu login e senha.');
      }

      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      sessionStorage.setItem('crm_session', 'authenticated');
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message || 'Erro ao comunicar com o servidor de autenticação.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Desconecta o WhatsApp com segurança (preserva as conversas e notas de CRM)
  const handleDisconnectWhatsApp = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error('Erro ao desconectar WhatsApp:', e);
    }
    setShowDisconnectConfirm(false);
  };

  // Sair do sistema (CRM logout)
  const handleSystemLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    sessionStorage.removeItem('crm_session');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsBooted(false);
    setBootProgress(0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = messageInput.trim();
    if (!textToSend || !activeChat || isSendingMessage) return;

    if (whatsappStatus !== 'connected') {
      alert('Não é possível enviar: o WhatsApp não está conectado no momento. Por favor, conecte o aparelho primeiro.');
      return;
    }

    setIsSendingMessage(true);
    setSendError('');

    try {
      await sendChatMessage(textToSend);
      setMessageInput(''); // Limpa o campo apenas após envio bem-sucedido
    } catch (err) {
      console.error('[Chat] Erro ao enviar mensagem:', err);
      const msg = err.message || 'Erro ao enviar mensagem pelo WhatsApp.';
      setSendError(msg);
      alert(`Falha no envio: ${msg}`);
    } finally {
      setIsSendingMessage(false);
    }
  };


  const handleUpdateName = () => {
    if (!nameInput.trim() || !activeChat) return;
    updateCRMInfo(activeChat.id, { name: nameInput });
    setEditingName(false);
  };

  const handleSaveNotes = async () => {
    if (!activeChat) return;
    setIsSavingNotes(true);
    await updateCRMInfo(activeChat.id, { notes: notesInput });
    setIsSavingNotes(false);
    setNotesSavedAlert(true);
    setTimeout(() => setNotesSavedAlert(false), 2000);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim() || !activeChat) return;
    
    const currentTags = activeChat.tags ? activeChat.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tagInput.trim())) {
      const updatedTags = [...currentTags, tagInput.trim()].join(',');
      updateCRMInfo(activeChat.id, { tags: updatedTags });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    if (!activeChat) return;
    const currentTags = activeChat.tags ? activeChat.tags.split(',').map(t => t.trim()) : [];
    const updatedTags = currentTags.filter(t => t !== tagToRemove).join(',');
    updateCRMInfo(activeChat.id, { tags: updatedTags });
  };

  const handleFunnelStageChange = (stage) => {
    if (!activeChat) return;
    updateCRMInfo(activeChat.id, { funnelStage: stage });
  };

  // Helper para rótulo legível do estágio de funil
  const getStageLabel = (stage) => {
    switch (stage) {
      case 'LEAD': return 'Leads';
      case 'NEGOTIATION': return 'Em Negociação';
      case 'PROPOSAL': return 'Proposta Enviada';
      case 'CLOSED': return 'Contrato Fechado';
      default: return stage;
    }
  };

  // Helper para cores do estágio comercial
  const getStageColor = (stage) => {
    switch (stage) {
      case 'LEAD': return 'bg-[#0284c7] text-white border-sky-400/20';
      case 'NEGOTIATION': return 'bg-[#d97706] text-white border-amber-500/20';
      case 'PROPOSAL': return 'bg-[#7c3aed] text-white border-purple-500/20';
      case 'CLOSED': return 'bg-[#00a884] text-white border-[#00a884]/20';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  // Formata hora legível do timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcula estatísticas comerciais baseado nos contatos ativos
  const getStats = () => {
    return {
      leads: chats.filter(c => c.funnelStage === 'LEAD').length,
      negotiating: chats.filter(c => c.funnelStage === 'NEGOTIATION').length,
      proposal: chats.filter(c => c.funnelStage === 'PROPOSAL').length,
      closed: chats.filter(c => c.funnelStage === 'CLOSED').length,
      total: chats.length
    };
  };

  const stats = getStats();

  // 1. TELA DE LOGIN MINIMALISTA - TEMA CLARO COM LOGO CRIADA DO PROJETO
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#f0f2f5] flex items-center justify-center p-4 select-none font-sans pixel-grid">
        <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-sm p-8 shadow-xl space-y-6 text-[#111b21]">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-1 bg-white border border-[#e9edef] rounded-full shadow-sm mb-2">
              <PixelLoomLogo size={48} />
            </div>
            <h1 className="text-2xl font-light tracking-[0.2em] text-[#111b21] uppercase">PixelLoom</h1>
            <p className="text-[9px] text-[#667781] font-semibold tracking-[0.3em] uppercase">Autenticação do Sistema</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#667781] uppercase tracking-wider">E-mail de Operador</label>
              <input
                type="email"
                required
                placeholder="nome@empresa.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-white border border-[#e9edef] rounded-lg px-3 py-2.5 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 placeholder-[#667781]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#667781] uppercase tracking-wider">Senha de Segurança</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white border border-[#e9edef] rounded-lg px-3 py-2.5 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 placeholder-[#667781]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#00a884] hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg active:scale-95 transition-all shadow-md border border-transparent mt-2 flex items-center justify-center gap-1.5"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <Lock size={13} />
                  Acessar Workspace
                </>
              )}
            </button>
          </form>

          <div className="text-[9px] text-center text-slate-400 font-medium pt-2 border-t border-[#e9edef]">
            Visualização restrita para Operadores autorizados &bull; v2.26
          </div>
        </div>
      </div>
    );
  }

  // 2. ULTRA-MINIMALIST SPLASH SCREEN - TEMA WHITE COM LOGO CRIADA (Roda após login)
  if (!isBooted) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center select-none font-sans">
        <div className="text-center space-y-6 animate-fade-in">
          
          <div className="flex justify-center mb-2">
            <PixelLoomLogo size={64} className="animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-light tracking-[0.25em] text-[#111b21] uppercase">PixelLoom</h1>
            <p className="text-[9px] text-[#667781] font-semibold tracking-[0.3em] uppercase">Sales CRM</p>
          </div>

          <div className="w-48 mx-auto space-y-2">
            <div className="w-full bg-[#f0f2f5] h-[2px] rounded-full overflow-hidden">
              <div 
                className="bg-[#00a884] h-full transition-all duration-300"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest">
              {bootProgress}%
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  // 3. INTERFACE PRINCIPAL DO CRM CLONE WHATSAPP
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] font-sans antialiased text-[#111b21] select-none">
      
      {/* 1. LEFT SLIM ICON NAVBAR (Tema White / Light Mode) */}
      <aside className="w-[60px] bg-[#f0f2f5] flex flex-col items-center justify-between py-4 border-r border-[#e9edef] shrink-0">
        
        {/* Top: Status & Logo/Avatar */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative" ref={null}>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowQrLinkPopup(v => !v)}
              title="Link de Conexão QR"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#e9edef] flex items-center justify-center font-bold text-slate-400 shadow-sm overflow-hidden">
                <PixelLoomLogo size={32} />
              </div>
              {/* Indicador de Status */}
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#f0f2f5] ${
                whatsappStatus === 'connected' ? 'bg-[#00a884]' : 
                whatsappStatus === 'qr' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
              }`} />
            </div>

            {/* Popup: Link copiável do QR */}
            {showQrLinkPopup && (
              <div className="absolute left-[68px] top-0 z-50 w-[300px] bg-white rounded-xl shadow-2xl border border-[#e9edef] p-4 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#111b21] uppercase tracking-widest">Link de Conexão</span>
                  <button onClick={() => setShowQrLinkPopup(false)} className="text-[#54656f] hover:text-[#111b21] text-lg leading-none">×</button>
                </div>
                <p className="text-[11px] text-[#667781] leading-relaxed">
                  Envie este link para qualquer dispositivo. Quem abrir consegue escanear o QR Code sem precisar de login.
                </p>
                <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2 border border-[#e9edef]">
                  <span className="text-[11px] text-[#3b4a54] truncate flex-1 font-mono select-all">{qrFullUrl}</span>
                  <button
                    onClick={handleCopyQrLink}
                    className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded transition-all ${
                      linkCopied ? 'bg-[#00a884] text-white' : 'bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#eae6df]'
                    }`}
                  >
                    {linkCopied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <button
                  onClick={() => { setShowQrLinkPopup(false); onGoToConnect(); }}
                  className="w-full py-2 rounded-lg bg-[#00a884] text-white text-[11px] font-bold hover:bg-[#008f72] transition-all"
                >
                  Abrir QR Code aqui →
                </button>
              </div>
            )}
          </div>

          {/* Botões de navegação */}
          <nav className="flex flex-col gap-4">
            {/* Chats ativos */}
            <button
              onClick={() => {
                setArchivedView(false);
                setActiveTab('chats');
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                activeTab === 'chats' && !archivedView
                  ? 'bg-[#eae6df] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Conversas"
            >
              <MessageSquare size={22} />
              {chats.some(c => c.unreadCount > 0 && !c.isArchived) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#00a884]" />
              )}
            </button>

            {/* Pipeline Comercial / Kanban */}
            <button
              onClick={() => {
                setActiveTab('kanban');
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                activeTab === 'kanban'
                  ? 'bg-[#eae6df] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Pipeline Comercial (Kanban)"
            >
              <Kanban size={22} />
            </button>

            {/* Dashboard & Métricas Analíticas */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                activeTab === 'dashboard'
                  ? 'bg-[#eae6df] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Dashboard & Inteligência Comercial"
            >
              <BarChart3 size={22} />
            </button>

            {/* Central de Automações & Regras (Fase 08) */}
            <button
              onClick={() => {
                setActiveTab('automations');
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                activeTab === 'automations'
                  ? 'bg-[#eae6df] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Central de Automações & Regras"
            >
              <Bot size={22} />
              {automations.some(a => a.enabled) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00a884]" />
              )}
            </button>

            {/* Copiloto & Configurações de IA (Fase 09) */}
            <button
              onClick={() => setShowAiSettingsModal(true)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                showAiSettingsModal
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Configurações do Copiloto IA"
            >
              <Sparkles size={22} className={aiConfig?.enabled ? "text-purple-600" : ""} />
              {aiConfig?.enabled && aiConfig?.hasApiKey && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-600" />
              )}
            </button>

            {/* Arquivados */}
            <button
              onClick={() => {
                setArchivedView(true);
                setActiveTab('chats');
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative ${
                activeTab === 'chats' && archivedView
                  ? 'bg-[#eae6df] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21]'
              }`}
              title="Conversas Arquivadas"
            >
              <FolderArchive size={22} />
            </button>

            {/* Gestão de Filiais e Atendentes */}
            <button
              onClick={() => {
                setTeamMsg({ type: '', text: '' });
                setShowStoreForm(false);
                setShowUserForm(false);
                setShowTeamModal(true);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all relative text-[#54656f] hover:bg-[#eae6df] hover:text-[#00a884]"
              title="Gestão de Filiais e Atendentes"
            >
              <Building2 size={22} />
            </button>
          </nav>
        </div>

        {/* Bottom: Ações & Logout */}
        <div className="flex flex-col items-center gap-3">

          {/* Botão: Compartilhar link do QR Code */}
          <button
            onClick={() => setShowQrLinkPopup(v => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-[#eae6df] hover:text-[#00a884] transition-all"
            title="Gerar Link de Conexão QR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <circle cx="17.5" cy="17.5" r="2.5"/>
            </svg>
          </button>

          {/* Botão: Conexão WhatsApp — sempre visível, muda cor/ação conforme status */}
          <button
            onClick={() => whatsappStatus === 'connected' ? setShowDisconnectConfirm(true) : onGoToConnect()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
              whatsappStatus === 'connected'
                ? 'text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                : 'text-amber-500 border-amber-200 bg-amber-50 hover:bg-amber-500 hover:text-white hover:border-amber-500'
            }`}
            title={whatsappStatus === 'connected' ? 'Desconectar Dispositivo WhatsApp' : 'Conectar WhatsApp'}
          >
            {whatsappStatus === 'connected' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              setTutorialStep(0);
              setShowTutorialModal(true);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-[#eae6df] hover:text-[#111b21] transition-all"
            title="Tutorial de Uso / Ajuda"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={handleSystemLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-[#eae6df] hover:text-rose-500 transition-all"
            title="Sair do Sistema"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. CHATS TAB VIEW */}
      {activeTab === 'chats' && (
        <div className="flex-1 overflow-hidden h-full bg-white flex">
          
          {/* Col 2.1: Chats List Sidebar */}
          <div className="w-[400px] bg-white flex flex-col border-r border-[#e9edef] shrink-0 h-full">
            
            {/* Header */}
            <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0">
              <span className="text-base font-bold tracking-wide text-[#111b21]">
                {archivedView ? 'Conversas Arquivadas' : 'Conversas'}
              </span>

              <div className="flex items-center gap-1.5 text-[#54656f]">
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="p-2 hover:bg-[#eae6df] rounded-full text-[#667781] hover:text-[#00a884] transition-colors"
                  title="Abrir Pipeline Comercial (Kanban)"
                >
                  <Kanban size={18} />
                </button>
                {archivedView && (
                  <button 
                    onClick={() => {
                      setArchivedView(false);
                      setActiveTab('chats');
                    }}
                    className="p-2 hover:bg-[#eae6df] rounded-full text-[#667781] hover:text-[#111b21]"
                    title="Voltar para conversas ativas"
                  >
                    <ArrowLeft size={19} />
                  </button>
                )}
              </div>
            </header>

            {/* Barra de Pesquisa */}
            <div className="p-2 bg-white border-b border-[#e9edef] shrink-0">
              <div className="relative bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 border border-transparent focus-within:border-[#00a884]/40">
                <Search size={15} className="text-[#667781] shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Pesquisar ou começar uma nova conversa"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-[#111b21] focus:outline-none placeholder-[#667781]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#667781] hover:text-black">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filtros Comerciais */}
            <div className="px-3 py-2 bg-white border-b border-[#e9edef] flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => setFilterFunnelStage('')}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border transition-all ${
                  !filterFunnelStage
                    ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884]'
                    : 'bg-[#f0f2f5] border-transparent text-[#667781] hover:bg-[#eae6df] hover:text-[#111b21]'
                }`}
              >
                Tudo
              </button>
              {['LEAD', 'NEGOTIATION', 'PROPOSAL', 'CLOSED'].map((stage) => {
                const isActive = filterFunnelStage === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => setFilterFunnelStage(stage)}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border transition-all ${
                      isActive
                        ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884]'
                        : 'bg-[#f0f2f5] border-transparent text-[#667781] hover:bg-[#eae6df] hover:text-[#111b21]'
                    }`}
                  >
                    {getStageLabel(stage)}
                  </button>
                );
              })}
            </div>

            {/* Filtros de Filial e Atendente (Multi-usuário Real) */}
            <div className="px-3 py-1.5 bg-[#f8f9fa] border-b border-[#e9edef] flex items-center gap-2 shrink-0">
              <div className="flex-1">
                <select
                  value={filterStoreId}
                  onChange={(e) => setFilterStoreId(e.target.value)}
                  className="w-full text-[10px] bg-white text-[#111b21] border border-[#e9edef] rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  title="Filtrar por Filial"
                >
                  <option value="">Todas as Filiais ({stores.length})</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  className="w-full text-[10px] bg-white text-[#111b21] border border-[#e9edef] rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  title="Filtrar por Atendente"
                >
                  <option value="">Todos Atendentes</option>
                  <option value="unassigned">Não Atribuídos</option>
                  {currentUser && (
                    <option value={currentUser.id}>Meus ({currentUser.name ? currentUser.name.split(' ')[0] : 'Eu'})</option>
                  )}
                  {users.filter(u => !currentUser || u.id !== currentUser.id).map(user => (
                    <option key={user.id} value={user.id}>{user.name || user.email}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Contatos */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e9edef] bg-white">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3 text-[#667781]">
                  <Loader2 className="animate-spin text-[#00a884]" size={24} />
                  <span className="text-xs">Carregando contatos...</span>
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-10 px-4 text-[#667781] text-xs">
                  Nenhum contato encontrado.
                </div>
              ) : (
                chats.map((chat) => {
                  const isSelected = activeChat && activeChat.id === chat.id;
                  const isHovered = hoveredChatId === chat.id;
                  const progress = syncProgresses[chat.id];

                  return (
                    <div
                      key={chat.id}
                      onClick={() => selectChat(chat)}
                      onMouseEnter={() => setHoveredChatId(chat.id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                      className={`relative flex flex-col justify-center px-3.5 py-3.5 cursor-pointer transition-all border-b border-[#e9edef] ${
                        isSelected 
                          ? 'bg-[#eae6df]' 
                          : 'hover:bg-[#f5f6f6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0 select-none">
                          {chat.avatarUrl ? (
                            <img
                              src={chat.avatarUrl}
                              alt={chat.name || chat.phone}
                              className="w-12 h-12 rounded-full object-cover border border-[#e9edef]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 border border-slate-300">
                              {chat.name ? chat.name.charAt(0).toUpperCase() : <User size={20} />}
                            </div>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[7px] font-bold ${
                            chat.funnelStage === 'CLOSED' ? 'bg-[#00a884]' :
                            chat.funnelStage === 'PROPOSAL' ? 'bg-[#7c3aed]' :
                            chat.funnelStage === 'NEGOTIATION' ? 'bg-[#d97706]' : 'bg-[#0284c7]'
                          }`} title={getStageLabel(chat.funnelStage)}>
                            {chat.funnelStage.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-[13.5px] font-semibold text-[#111b21] truncate pr-2">
                              {chat.name || chat.phone}
                            </h4>
                            <span className="text-[10px] text-[#667781] shrink-0 font-medium">
                              {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-[11.5px] text-[#667781] truncate flex-1 pr-3">
                              {chat.lastMessageText || <span className="italic text-slate-400">Nenhuma mensagem</span>}
                            </p>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {chat.tags && (
                                <span className="bg-[#f0f2f5] border border-slate-300 text-slate-600 text-[8px] px-1 rounded font-bold uppercase truncate max-w-[50px]">
                                  {chat.tags.split(',')[0]}
                                </span>
                              )}

                              {chat.unreadCount > 0 && (
                                <span className="bg-[#00a884] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Badges de Filial e Atendente */}
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-[#667781]">
                            {chat.store && (
                              <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8.5px] font-medium border border-slate-200/50">
                                <Building size={9} className="text-slate-400" />
                                <span className="truncate max-w-[90px]">{chat.store.name}</span>
                              </span>
                            )}
                            {chat.assignedUser ? (
                              <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8.5px] font-medium border border-emerald-200/50">
                                <UserCheck size={9} className="text-emerald-500" />
                                <span className="truncate max-w-[90px]">{chat.assignedUser.name || chat.assignedUser.email}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[8.5px] font-normal border border-amber-200/40 italic">
                                Não atribuído
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso Real de Sincronização */}
                      {progress && progress.status !== 'completed' && (
                        <div className="mt-2.5 bg-[#f0f2f5] border border-[#e9edef] rounded-lg p-2 space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] text-[#00a884] font-bold">
                            <span className="flex items-center gap-1">
                              <Loader2 className="animate-spin" size={10} />
                              Sincronizando...
                            </span>
                            <span className="text-[#667781]">Faltam {progress.estTimeSeconds || 0}s</span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-[#00a884] h-full transition-all duration-500"
                              style={{ width: `${progress.percent || 0}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[8px] text-slate-500 font-semibold">
                            <span>Concluído: {progress.percent || 0}%</span>
                            <span>{progress.current || 0}/{progress.total || 200}</span>
                          </div>
                        </div>
                      )}

                      {/* Botão rápido para Arquivar */}
                      {isHovered && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                          {archivedView ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveChat(chat.id, false);
                              }}
                              className="p-2 bg-white hover:bg-[#f5f6f6] text-[#00a884] rounded-full border border-[#e9edef] shadow-md flex items-center justify-center"
                              title="Desarquivar"
                            >
                              <FolderOpen size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveChat(chat.id, true);
                              }}
                              className="p-2 bg-white hover:bg-[#f5f6f6] text-amber-500 rounded-full border border-[#e9edef] shadow-md flex items-center justify-center"
                              title="Arquivar"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 2.2: Active Chat Area & Light Wallpaper */}
          <div className="flex-1 bg-[#efeae2] flex flex-col h-full relative overflow-hidden">
            {/* Original Light WhatsApp Doodle Wallpaper */}
            <div 
              className="absolute inset-0 opacity-[0.4] pointer-events-none select-none"
              style={{
                backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                backgroundRepeat: 'repeat',
              }}
            />

            {activeChat ? (
              <>
                {/* Chat Header */}
                <header className="h-[60px] bg-[#f0f2f5] border-b border-[#e9edef] px-4 flex items-center justify-between shrink-0 z-10 select-none">
                  <div className="flex items-center gap-3">
                    {activeChat.avatarUrl ? (
                      <img 
                        src={activeChat.avatarUrl} 
                        alt={activeChat.name || activeChat.phone} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 select-none border border-[#e9edef]" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold border border-slate-400 select-none">
                        {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={18} />}
                      </div>
                    )}

                    <div className="min-w-0">
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={handleUpdateName}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                            className="bg-white border border-[#00a884] rounded-md px-2 py-0.5 text-xs text-[#111b21] focus:outline-none"
                            autoFocus
                          />
                          <button onClick={handleUpdateName} className="text-[#00a884] hover:text-black">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 
                            className="text-[13.5px] font-bold text-[#111b21] truncate cursor-pointer hover:underline"
                            onClick={() => setEditingName(true)}
                            title="Clique para editar nome"
                          >
                            {activeChat.name || activeChat.phone}
                          </h3>
                          <button onClick={() => setEditingName(true)} className="text-[#667781] hover:text-black">
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-[#667781] font-medium flex items-center gap-2 mt-0.5">
                        <span>{activeChat.phone}</span>
                        {activeChat.pushName && (
                          <span className="italic text-slate-400">({activeChat.pushName})</span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStageColor(activeChat.funnelStage)}`}>
                          {getStageLabel(activeChat.funnelStage)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#54656f]">
                    <button
                      onClick={() => setShowCrmPanel(!showCrmPanel)}
                      className={`p-2.5 rounded-full transition-colors ${
                        showCrmPanel ? 'bg-[#eae6df] text-[#00a884]' : 'hover:bg-[#eae6df]'
                      }`}
                      title={showCrmPanel ? "Fechar Informações de CRM" : "Abrir Ficha de CRM"}
                    >
                      <Tags size={18} />
                    </button>
                    {/* Botão Copiloto IA no Header */}
                    <button
                      onClick={() => {
                        setAiPanelOpen(prev => !prev);
                        if (!aiPanelOpen && !aiSuggestion) {
                          handleTriggerCopilot('suggest');
                        }
                      }}
                      className={`p-2.5 rounded-full transition-colors ${
                        aiPanelOpen ? 'bg-purple-100 text-purple-700' : 'hover:bg-[#eae6df] text-purple-600'
                      }`}
                      title="Copiloto Comercial de IA"
                    >
                      <Sparkles size={18} />
                    </button>
                    <button
                      onClick={() => setShowInChatSearch(prev => !prev)}
                      className={`p-2.5 rounded-full transition-colors ${
                        showInChatSearch ? 'bg-[#eae6df] text-[#00a884]' : 'hover:bg-[#eae6df]'
                      }`}
                      title="Pesquisar mensagens nesta conversa"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </header>

                {/* Barra de Pesquisa Interna no Chat (Fase 04) */}
                {showInChatSearch && (
                  <div className="bg-white border-b border-[#e9edef] px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-20 shadow-sm animate-fade-in select-none">
                    <div className="relative flex-1 flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5 border border-transparent focus-within:border-[#00a884]">
                      <Search size={15} className="text-[#667781] mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Pesquisar mensagens nesta conversa..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.shiftKey) handlePrevMatch();
                            else handleNextMatch();
                          } else if (e.key === 'Escape') {
                            setShowInChatSearch(false);
                          }
                        }}
                        autoFocus
                        className="w-full bg-transparent border-none text-xs text-[#111b21] focus:outline-none placeholder-[#667781]"
                      />
                      {chatSearchQuery && (
                        <button
                          onClick={() => setChatSearchQuery('')}
                          className="text-[#667781] hover:text-black p-0.5 rounded"
                          title="Limpar texto"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-[#667781] font-medium min-w-[70px] text-center">
                        {chatSearchQuery.trim() ? (
                          searchMatches.length > 0 ? (
                            `${currentMatchIdx + 1} de ${searchMatches.length}`
                          ) : (
                            '0 resultados'
                          )
                        ) : (
                          'Digite algo'
                        )}
                      </span>

                      <button
                        onClick={handlePrevMatch}
                        disabled={searchMatches.length === 0}
                        className="p-1.5 hover:bg-[#f0f2f5] rounded text-[#54656f] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Anterior (Shift+Enter)"
                      >
                        <ChevronUp size={16} />
                      </button>

                      <button
                        onClick={handleNextMatch}
                        disabled={searchMatches.length === 0}
                        className="p-1.5 hover:bg-[#f0f2f5] rounded text-[#54656f] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Próxima (Enter)"
                      >
                        <ChevronDown size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setShowInChatSearch(false);
                          setChatSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-[#f0f2f5] rounded text-[#54656f] hover:text-black ml-1"
                        title="Fechar busca (Esc)"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {activeChat.isArchived && (
                  <div className="bg-white border-b border-[#e9edef] py-2 px-4 flex items-center justify-between text-xs text-amber-600 font-medium shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Archive size={14} />
                      <span>Esta conversa está arquivada no WhatsApp.</span>
                    </div>
                    <button 
                      onClick={() => archiveChat(activeChat.id, false)}
                      className="px-3 py-1 bg-[#00a884] text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                      Desarquivar
                    </button>
                  </div>
                )}

                {/* Barra de Progresso Real do Chat Ativo */}
                {syncProgresses[activeChat.id] && syncProgresses[activeChat.id].status !== 'completed' && (
                  <div className="bg-white/95 border border-[#00a884]/30 rounded-xl p-3.5 space-y-2.5 mx-4 my-2 text-xs shadow-md backdrop-blur-sm z-20 animate-fade-in shrink-0 text-[#111b21]">
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center gap-2 text-[#00a884]">
                        <Loader2 className="animate-spin" size={13} />
                        Sincronizando Histórico com Celular...
                      </span>
                      <span className="text-[10px] text-[#667781] bg-[#f0f2f5] px-2 py-0.5 rounded border border-[#e9edef]">
                        Estimado: ~{syncProgresses[activeChat.id].estTimeSeconds || 0}s restantes
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-[#e9edef]">
                      <div 
                        className="bg-[#00a884] h-full transition-all duration-500" 
                        style={{ width: `${syncProgresses[activeChat.id].percent || 0}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-[#667781]">
                      <span>Progresso: <strong>{syncProgresses[activeChat.id].percent || 0}%</strong> completo</span>
                      <span>Baixado: <strong>{syncProgresses[activeChat.id].current || 0} / {syncProgresses[activeChat.id].total || 200}</strong> mensagens</span>
                    </div>
                  </div>
                )}

                {/* Message Bubble List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 flex flex-col">
                  {loadingMessages ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#667781] gap-3">
                      <Loader2 className="animate-spin text-[#00a884]" size={28} />
                      <span className="text-xs">Carregando histórico...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[#667781] text-xs italic">
                      Nenhuma mensagem sincronizada localmente.
                    </div>
                  ) : (
                    <>
                      {/* Paginação inteligente: sabe quando acabou o histórico */}
                      <div className="flex justify-center my-3">
                        {loadingMoreMessages ? (
                          // Carregando mais mensagens do WhatsApp
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#e9edef] text-[11px] text-[#667781] shadow-sm">
                            <Loader2 size={12} className="animate-spin text-[#00a884]" />
                            Buscando histórico anterior...
                          </div>
                        ) : hasMoreMessages ? (
                          // Ainda pode ter mensagens mais antigas
                          <button
                            onClick={() => loadMoreMessages(activeChat.id)}
                            className="px-4 py-2 rounded-xl bg-white border border-[#e9edef] text-[11px] font-bold text-[#00a884] hover:bg-[#f5f6f6] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Clock size={12} />
                            Carregar histórico anterior
                          </button>
                        ) : (
                          // Início da conversa atingido
                          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f0f2f5] border border-[#e9edef] text-[10px] text-[#667781]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Início da conversa
                          </div>
                        )}
                      </div>

                      {messages.map((msg) => {
                        const isMe = msg.fromMe;
                        const isCurrentMatch = searchMatches[currentMatchIdx] === msg.id;
                        const isMatched = searchMatches.includes(msg.id);

                        return (
                          <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in transition-all duration-300`}
                          >
                            <div
                              className={`max-w-md rounded-lg p-2.5 text-[12.5px] border relative group transition-all duration-300 ${
                                isCurrentMatch ? 'ring-2 ring-[#00a884] ring-offset-2 shadow-lg' : ''
                              } ${
                                isMe
                                  ? 'bg-[#d9fdd3] border-[#d0f4ca] text-[#111b21] rounded-tr-none shadow-sm'
                                  : 'bg-white border-white text-[#111b21] rounded-tl-none shadow-sm'
                              }`}
                            >
                              {isMe ? null : msg.senderName ? (
                                <span className="block text-[10px] font-bold text-[#0270ca] mb-1">
                                  {msg.senderName}
                                </span>
                              ) : null}
                              
                              {/* RENDERIZAÇÃO DE TIPOS DE MÍDIA REAIS (Fase 04) */}
                              {msg.type === 'image' ? (
                                <div className="space-y-1.5 cursor-pointer" onClick={() => {
                                  if (msg.mediaUrl) {
                                    const imgUrl = msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${backendUrl}${msg.mediaUrl}`;
                                    setSelectedImagePreview(imgUrl);
                                  }
                                }}>
                                  <div className="relative rounded-md overflow-hidden border border-[#e9edef] max-w-[285px] bg-[#f0f2f5] min-h-[100px] flex items-center justify-center">
                                    {msg.mediaUrl ? (
                                      <img 
                                        src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${backendUrl}${msg.mediaUrl}`} 
                                        alt="Imagem" 
                                        className="w-full h-auto max-h-[190px] object-cover hover:scale-[1.02] transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : null}
                                    <div className="flex flex-col items-center justify-center p-4 text-[#667781] text-xs gap-1.5" style={{ display: msg.mediaUrl ? 'none' : 'flex' }}>
                                      <AlertCircle size={18} className="text-amber-500" />
                                      <span className="text-[10px]">Imagem não disponível ou expirada</span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors pointer-events-none" />
                                  </div>
                                  {msg.text && <p className="whitespace-pre-wrap leading-relaxed break-words mt-1">{renderMessageText(msg.text, isCurrentMatch)}</p>}
                                </div>
                              ) : msg.type === 'audio' ? (
                                <VoiceNotePlayer 
                                  mediaUrl={msg.mediaUrl} 
                                  backendUrl={backendUrl} 
                                  isMe={isMe} 
                                />
                              ) : msg.type === 'document' ? (
                                <DocumentCard 
                                  msg={msg} 
                                  backendUrl={backendUrl} 
                                  isMe={isMe} 
                                />
                              ) : msg.type === 'video' ? (
                                <div className="rounded-md overflow-hidden border border-[#e9edef] max-w-[285px] bg-[#f0f2f5]">
                                  {msg.mediaUrl ? (
                                    <video 
                                      src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${backendUrl}${msg.mediaUrl}`} 
                                      controls 
                                      className="w-full h-auto max-h-[200px] object-cover" 
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-[#667781] text-xs gap-1.5">
                                      <AlertCircle size={18} className="text-amber-500" />
                                      <span className="text-[10px]">Vídeo não disponível ou expirado</span>
                                    </div>
                                  )}
                                  {msg.text && <p className="whitespace-pre-wrap leading-relaxed break-words p-1 text-xs">{renderMessageText(msg.text, isCurrentMatch)}</p>}
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed break-words">
                                  {renderMessageText(msg.text, isCurrentMatch)}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#667781] select-none">
                                <span>{formatTime(msg.timestamp)}</span>
                                {isMe && (
                                  <span>
                                    {msg.status === 'READ' && <CheckCheck size={12} className="text-[#53bdeb]" />}
                                    {msg.status === 'DELIVERED' && <CheckCheck size={12} />}
                                    {msg.status === 'SENT' && <Check size={12} />}
                                    {msg.status === 'PENDING' && <Clock size={12} className="animate-pulse" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* PAINEL DO COPILOTO DE IA (Fase 09) */}
                {aiPanelOpen && (
                  <div className="bg-white border-t border-[#e9edef] px-4 py-3 shadow-lg z-20 animate-fade-in">
                    <div className="max-w-4xl mx-auto space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#f0f2f5]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Sparkles size={14} />
                          </div>
                          <span className="text-xs font-bold text-[#111b21]">
                            Copiloto Comercial IA
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700">
                            {aiConfig?.provider === 'openai' ? 'OpenAI' : 'Google Gemini'} ({aiConfig?.model || 'gemini-1.5-flash'})
                          </span>
                        </div>
                        <button
                          onClick={() => setAiPanelOpen(false)}
                          className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                          title="Fechar Copiloto"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Estado: Gerando resposta */}
                      {aiGenerating && (
                        <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                          <Loader2 size={24} className="animate-spin text-purple-600" />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#111b21]">
                              Consultando Inteligência Artificial...
                            </p>
                            <p className="text-[11px] text-[#667781]">
                              Lendo histórico recente do WhatsApp e gerando recomendação de atendimento.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Estado: Erro */}
                      {!aiGenerating && aiError && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-700">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-medium leading-relaxed">{aiError}</p>
                          </div>
                          <button
                            onClick={() => setShowAiSettingsModal(true)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-sm shrink-0 transition-colors"
                          >
                            Configurar Chave de IA
                          </button>
                        </div>
                      )}

                      {/* Estado: Sugestão Gerada */}
                      {!aiGenerating && aiSuggestion && (
                        <div className="space-y-3">
                          <div className="bg-[#f8f9fa] border border-[#e9edef] rounded-xl p-3 max-h-56 overflow-y-auto">
                            <p className="text-xs text-[#111b21] whitespace-pre-wrap leading-relaxed">
                              {aiSuggestion.text}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleApplyAiSuggestion}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                                title="Inserir no campo de envio"
                              >
                                <SendHorizontal size={14} />
                                <span>Inserir no Chat</span>
                              </button>
                              <button
                                onClick={handleCopyAiSuggestion}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d1d7db] hover:bg-[#f0f2f5] text-xs font-semibold text-[#54656f] rounded-lg transition-colors"
                                title="Copiar texto"
                              >
                                {aiCopied ? (
                                  <>
                                    <CheckCheck size={14} className="text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <button
                              onClick={() => handleTriggerCopilot(aiSuggestion.mode || 'suggest')}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#54656f] hover:text-[#111b21] hover:bg-[#f0f2f5] rounded-lg transition-colors"
                              title="Gerar nova sugestão"
                            >
                              <RefreshCw size={13} />
                              <span>Regenerar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Barra de Ações Rápidas do Copiloto IA (Fase 09) */}
                <div className="bg-[#f0f2f5] px-4 pt-1.5 pb-0 flex items-center justify-between text-[11px] border-t border-[#e9edef] select-none">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-purple-700 font-bold flex items-center gap-1 shrink-0">
                      <Sparkles size={12} className="text-purple-600" />
                      Copiloto:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTriggerCopilot('suggest')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-[#d1d7db] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs"
                    >
                      Sugerir Resposta
                    </button>
                    <button
                      type="button"
                      disabled={!messageInput.trim()}
                      onClick={() => handleTriggerCopilot('improve')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-[#d1d7db] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-[#d1d7db]"
                    >
                      Melhorar Rascunho
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerCopilot('summarize')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-[#d1d7db] hover:border-purple-300 font-semibold text-[10px] shrink-0 transition-colors shadow-2xs"
                    >
                      Resumir Conversa
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiSettingsModal(true)}
                    className="p-1 text-slate-400 hover:text-purple-600 rounded-md hover:bg-white transition-colors shrink-0 ml-2"
                    title="Configurações de IA"
                  >
                    <Sliders size={13} />
                  </button>
                </div>

                {/* Input Bar */}
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex flex-col justify-center shrink-0 z-10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <div className="flex items-center text-[#54656f] gap-1 shrink-0">
                      <button type="button" className="p-2 hover:bg-[#eae6df] rounded-full">
                        <Smile size={22} />
                      </button>
                      <button type="button" className="p-2 hover:bg-[#eae6df] rounded-full">
                        <Paperclip size={22} />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder={
                        whatsappStatus !== 'connected'
                          ? "Conecte o WhatsApp para enviar mensagens"
                          : isSendingMessage
                          ? "Enviando mensagem..."
                          : "Digite uma mensagem"
                      }
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={whatsappStatus !== 'connected' || isSendingMessage}
                      className="flex-1 bg-white border border-white rounded-lg px-4 py-2.5 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 placeholder-[#667781] disabled:opacity-40"
                    />
                    
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || whatsappStatus !== 'connected' || isSendingMessage}
                      className="w-10 h-10 rounded-full bg-[#00a884] disabled:bg-[#f0f2f5] text-white disabled:text-[#667781] flex items-center justify-center hover:bg-emerald-500 active:scale-95 transition-all shrink-0 shadow-md border border-transparent"
                    >
                      {isSendingMessage ? (
                        <Loader2 size={16} className="animate-spin text-white" />
                      ) : (
                        <Send size={16} className="ml-0.5 text-white" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Chat Selected View */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 select-none bg-[#f8f9fa]/80">
                <div className="max-w-md space-y-6 flex flex-col items-center">
                  <div className="inline-flex p-6 rounded-full bg-[#f0f2f5] text-[#00a884] border border-[#e9edef] shadow-sm">
                    <PixelLoomLogo size={64} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-light text-[#111b21]">PixelLoom CRM</h3>
                    <p className="text-xs text-[#667781] leading-relaxed max-w-sm mx-auto">
                      Selecione um cliente na lista lateral para iniciar o atendimento, registrar notas comerciais e qualificar leads.
                    </p>
                  </div>

                  <div className="w-full bg-white border border-[#e9edef] p-4 rounded-xl text-left shadow-sm space-y-3">
                    <p className="text-[10px] font-bold tracking-widest text-[#667781] uppercase flex items-center gap-1.5 border-b border-[#e9edef] pb-2">
                      <Award size={13} className="text-[#00a884]" />
                      Funil Comercial (Contagem)
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <div className="bg-[#f0f2f5] py-2 rounded-lg border border-[#e9edef]">
                        <p className="text-xs font-bold text-[#0284c7]">{stats.leads}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Leads</p>
                      </div>
                      <div className="bg-[#f0f2f5] py-2 rounded-lg border border-[#e9edef]">
                        <p className="text-xs font-bold text-[#d97706]">{stats.negotiating}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Negoc.</p>
                      </div>
                      <div className="bg-[#f0f2f5] py-2 rounded-lg border border-[#e9edef]">
                        <p className="text-xs font-bold text-[#7c3aed]">{stats.proposal}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Prop.</p>
                      </div>
                      <div className="bg-[#f0f2f5] py-2 rounded-lg border border-[#e9edef]">
                        <p className="text-xs font-bold text-[#00a884]">{stats.closed}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Fech.</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#667781] flex items-center gap-1 border-t border-[#e9edef] pt-4 w-full justify-center">
                    <ShieldAlert size={12} className="text-[#00a884]" />
                    <span>Conectado com segurança via Baileys API</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Col 2.3: CRM Contact Details Drawer */}
          {activeChat && showCrmPanel && (
            <aside className="w-[360px] shrink-0 bg-white flex flex-col border-l border-[#e9edef] select-none h-full z-20">
              
              <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0 border-b border-[#e9edef]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Dados do Contato</h3>
                <button 
                  onClick={() => setShowCrmPanel(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="flex flex-col items-center text-center pb-5 border-b border-[#e9edef]">
                  {activeChat.avatarUrl ? (
                    <img 
                      src={activeChat.avatarUrl} 
                      alt={activeChat.name || activeChat.phone} 
                      className="w-20 h-20 rounded-full object-cover shrink-0 select-none border border-[#e9edef] shadow-sm mb-3" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold border border-slate-300 shadow-sm mb-3 select-none">
                      {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={28} />}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-[#111b21]">{activeChat.name || activeChat.phone}</h3>
                  <p className="text-[11px] text-[#667781] mt-1 font-medium">{activeChat.phone}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                    <Award size={14} className="text-[#00a884]" />
                    Estágio Comercial do Lead
                  </label>
                  
                  <div className="space-y-1.5">
                    {['LEAD', 'NEGOTIATION', 'PROPOSAL', 'CLOSED'].map((stage) => {
                      const isSelected = activeChat.funnelStage === stage;
                      return (
                        <button
                          key={stage}
                          onClick={() => handleFunnelStageChange(stage)}
                          className={`w-full py-2 px-3 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#00a884]/10 border-[#00a884]/40 text-[#00a884] shadow-sm'
                              : 'bg-[#f0f2f5] border-transparent text-[#667781] hover:text-[#111b21] hover:bg-[#eae6df]'
                          }`}
                        >
                          <span>{getStageLabel(stage)}</span>
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filial / Unidade */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                    <Building size={14} className="text-[#00a884]" />
                    Filial / Unidade
                  </label>
                  <select
                    value={activeChat.storeId || ''}
                    onChange={async (e) => {
                      const newStoreId = e.target.value || null;
                      await assignChat(activeChat.id, { storeId: newStoreId, assignedUserId: activeChat.assignedUserId });
                    }}
                    className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-2.5 py-2 text-xs text-[#111b21] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 cursor-pointer"
                  >
                    <option value="">Sem Filial Atribuída</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Atendente Responsável */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                    <UserCheck size={14} className="text-[#00a884]" />
                    Atendente Responsável
                  </label>
                  <select
                    value={activeChat.assignedUserId || ''}
                    onChange={async (e) => {
                      const newUserId = e.target.value || null;
                      await assignChat(activeChat.id, { storeId: activeChat.storeId, assignedUserId: newUserId });
                    }}
                    className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-2.5 py-2 text-xs text-[#111b21] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 cursor-pointer"
                  >
                    <option value="">Não Atribuído (Nenhum)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.role === 'ADMIN' ? 'Admin' : 'Operador'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                    <Tags size={14} className="text-[#00a884]" />
                    Tags e Classificadores
                  </label>
                  
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#f0f2f5]/40 border border-[#e9edef] rounded-lg">
                    {activeChat.tags ? (
                      activeChat.tags.split(',').filter(Boolean).map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#e9edef] text-[#667781] text-[9px] px-2 py-0.5 rounded flex items-center gap-1.5 group font-bold uppercase shadow-sm"
                        >
                          {t}
                          <button
                            onClick={() => handleRemoveTag(t)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic select-none">Nenhuma tag criada</span>
                    )}
                  </div>

                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Criar tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 bg-white border border-[#e9edef] rounded-lg px-2.5 py-1.5 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 placeholder-[#667781]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 bg-[#00a884] hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-all shadow-sm border border-transparent"
                    >
                      <Plus size={15} />
                    </button>
                  </form>
                </div>

                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                      <FileText size={14} className="text-[#00a884]" />
                      Histórico / Anotações
                    </label>
                    {notesSavedAlert && (
                      <span className="text-[9px] text-[#00a884] font-bold animate-pulse">Salvo!</span>
                    )}
                  </div>

                  <textarea
                    placeholder="Adicione anotações sobre este cliente..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={5}
                    className="w-full flex-1 bg-white border border-[#e9edef] rounded-lg p-3 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 placeholder-[#667781] resize-none min-h-[120px]"
                  />

                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="w-full py-2.5 bg-[#00a884] hover:bg-emerald-500 disabled:bg-[#00a884]/40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md border border-transparent"
                  >
                    {isSavingNotes ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    Salvar Anotações
                  </button>
                </div>
              </div>
            </aside>
          )}

        </div>
      )}

      {/* 3. KANBAN PIPELINE VIEW (Fase 06 - Pipeline Comercial Real) */}
      {activeTab === 'kanban' && (
        <div className="flex-1 overflow-hidden h-full bg-[#f0f2f5] flex flex-col">
          {/* Header do Kanban */}
          <header className="h-[60px] bg-white border-b border-[#e9edef] px-6 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00a884]/10 text-[#00a884] flex items-center justify-center font-bold">
                <Kanban size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111b21]">Pipeline Comercial & Funil de Vendas</h2>
                <p className="text-[10px] text-[#667781]">Arraste e solte os cards entre as colunas para atualizar a etapa do lead em tempo real</p>
              </div>
            </div>

            {/* Ações e Filtros do Kanban */}
            <div className="flex items-center gap-2.5">
              {/* Busca */}
              <div className="relative bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 border border-[#e9edef] focus-within:border-[#00a884] w-52">
                <Search size={14} className="text-[#667781] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar lead ou telefone..."
                  value={kanbanSearch}
                  onChange={(e) => setKanbanSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-[#111b21] focus:outline-none w-full placeholder-[#667781]"
                />
                {kanbanSearch && (
                  <button onClick={() => setKanbanSearch('')} className="text-slate-400 hover:text-black">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filtro por Filial */}
              <select
                value={kanbanStoreFilter}
                onChange={(e) => setKanbanStoreFilter(e.target.value)}
                className="text-xs bg-[#f0f2f5] text-[#111b21] border border-[#e9edef] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                title="Filtrar por Filial"
              >
                <option value="">Todas Filiais ({stores.length})</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Filtro por Atendente */}
              <select
                value={kanbanUserFilter}
                onChange={(e) => setKanbanUserFilter(e.target.value)}
                className="text-xs bg-[#f0f2f5] text-[#111b21] border border-[#e9edef] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                title="Filtrar por Atendente"
              >
                <option value="">Todos Atendentes</option>
                <option value="unassigned">Não Atribuídos</option>
                {currentUser && (
                  <option value={currentUser.id}>Meus ({currentUser.name ? currentUser.name.split(' ')[0] : 'Eu'})</option>
                )}
                {users.filter(u => !currentUser || u.id !== currentUser.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>

              {/* Botão de Atalho para Conversas */}
              <button
                onClick={() => setActiveTab('chats')}
                className="px-3.5 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare size={14} />
                <span>Ver Conversas</span>
              </button>
            </div>
          </header>

          {/* Kanban Board Colunas */}
          <div className="flex-1 overflow-x-auto p-6 flex gap-5">
            {[
              { id: 'LEAD', label: 'Leads', headerColor: 'border-t-sky-500', dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800' },
              { id: 'NEGOTIATION', label: 'Em Negociação', headerColor: 'border-t-amber-500', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
              { id: 'PROPOSAL', label: 'Proposta Enviada', headerColor: 'border-t-purple-500', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' },
              { id: 'CLOSED', label: 'Contrato Fechado', headerColor: 'border-t-[#00a884]', dot: 'bg-[#00a884]', badge: 'bg-emerald-100 text-emerald-800' }
            ].map(col => {
              // Filtra os chats para esta coluna
              const stageChats = chats.filter(c => {
                if (c.isArchived) return false;
                if (c.funnelStage !== col.id) return false;
                if (kanbanStoreFilter && c.storeId !== kanbanStoreFilter) return false;
                if (kanbanUserFilter) {
                  if (kanbanUserFilter === 'unassigned' && c.assignedUserId) return false;
                  if (kanbanUserFilter !== 'unassigned' && c.assignedUserId !== kanbanUserFilter) return false;
                }
                if (kanbanSearch) {
                  const q = kanbanSearch.toLowerCase();
                  const matchName = (c.name || '').toLowerCase().includes(q);
                  const matchPhone = (c.phone || '').toLowerCase().includes(q);
                  const matchPush = (c.pushName || '').toLowerCase().includes(q);
                  const matchTags = (c.tags || '').toLowerCase().includes(q);
                  if (!matchName && !matchPhone && !matchPush && !matchTags) return false;
                }
                return true;
              });

              const isDragOver = dragOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={() => setDragOverStage(col.id)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDragOverStage(null);
                    }
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                    const chatId = e.dataTransfer.getData('text/plain');
                    if (chatId) {
                      await handleDropStage(chatId, col.id);
                    }
                  }}
                  className={`flex-1 min-w-[280px] max-w-[340px] bg-white rounded-2xl border flex flex-col shadow-sm transition-all border-t-4 ${col.headerColor} ${
                    isDragOver 
                      ? 'border-[#00a884] ring-2 ring-[#00a884]/30 bg-emerald-50/20' 
                      : 'border-[#e9edef]'
                  }`}
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="p-4 border-b border-[#e9edef] flex items-center justify-between bg-white rounded-t-xl shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="text-xs font-bold text-[#111b21] uppercase tracking-wide">
                        {col.label}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                      {stageChats.length}
                    </span>
                  </div>

                  {/* Lista de Cards da Coluna */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa]">
                    {stageChats.length === 0 ? (
                      <div className="h-40 border-2 border-dashed border-[#e9edef] rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium">Nenhum lead nesta etapa</p>
                        <p className="text-[10px] text-slate-400 mt-1">Arraste um card até aqui</p>
                      </div>
                    ) : (
                      stageChats.map(chat => {
                        const isDragging = draggingChatId === chat.id;

                        return (
                          <div
                            key={chat.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', chat.id);
                              setDraggingChatId(chat.id);
                            }}
                            onDragEnd={() => setDraggingChatId(null)}
                            className={`bg-white rounded-xl p-3.5 border border-[#e9edef] shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 select-none ${
                              isDragging ? 'opacity-40 scale-95 border-dashed border-[#00a884]' : ''
                            }`}
                          >
                            {/* Card Top: Avatar + Nome + Tempo */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {chat.avatarUrl ? (
                                  <img
                                    src={chat.avatarUrl}
                                    alt={chat.name || chat.phone}
                                    className="w-8 h-8 rounded-full object-cover border border-[#e9edef] shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-300 shrink-0">
                                    {chat.name ? chat.name.charAt(0).toUpperCase() : <User size={14} />}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[#111b21] truncate">
                                    {chat.name || chat.phone}
                                  </h4>
                                  <p className="text-[10px] text-[#667781] truncate">{chat.phone}</p>
                                </div>
                              </div>
                              <span className="text-[9px] text-[#667781] shrink-0 font-medium">
                                {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                              </span>
                            </div>

                            {/* Card Middle: Última mensagem */}
                            {chat.lastMessageText && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 bg-[#f8f9fa] p-2 rounded-lg border border-[#e9edef]/60">
                                {chat.lastMessageText}
                              </p>
                            )}

                            {/* Badges de Filial & Atendente */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                              {chat.store && (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200/60">
                                  <Building size={10} className="text-slate-400" />
                                  <span className="truncate max-w-[120px]">{chat.store.name}</span>
                                </span>
                              )}
                              {chat.assignedUser ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200/50">
                                  <UserCheck size={10} className="text-emerald-500" />
                                  <span className="truncate max-w-[120px]">{chat.assignedUser.name || chat.assignedUser.email}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded italic border border-amber-200/50">
                                  Não atribuído
                                </span>
                              )}
                            </div>

                            {/* Tags do Lead */}
                            {chat.tags && (
                              <div className="flex flex-wrap gap-1">
                                {chat.tags.split(',').filter(Boolean).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-white border border-[#e9edef] text-slate-600 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Card Footer: Ação Rápida e Troca de Estágio */}
                            <div className="pt-2 border-t border-[#e9edef] flex items-center justify-between gap-2">
                              {/* Seletor rápido de estágio */}
                              <select
                                value={chat.funnelStage}
                                onChange={(e) => handleDropStage(chat.id, e.target.value)}
                                className="text-[10px] bg-[#f0f2f5] text-slate-700 font-semibold border border-[#e9edef] rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                                title="Alterar estágio comercial"
                              >
                                <option value="LEAD">Leads</option>
                                <option value="NEGOTIATION">Negociação</option>
                                <option value="PROPOSAL">Proposta</option>
                                <option value="CLOSED">Fechado</option>
                              </select>

                              {/* Botão de abrir conversa */}
                              <button
                                onClick={() => {
                                  selectChat(chat);
                                  setActiveTab('chats');
                                }}
                                className="px-2.5 py-1 bg-[#00a884] hover:bg-emerald-600 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-sm transition-all"
                                title="Abrir conversa com este cliente"
                              >
                                <MessageSquare size={11} />
                                <span>Conversar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DASHBOARD VIEW (Fase 07 - Dashboard Real & Métricas Analíticas) */}
      {activeTab === 'dashboard' && (
        <div className="flex-1 overflow-y-auto h-full bg-[#f8f9fa] flex flex-col">
          {/* Header do Dashboard */}
          <header className="h-[65px] bg-white border-b border-[#e9edef] px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a884]/10 text-[#00a884] flex items-center justify-center font-bold">
                <BarChart3 size={22} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111b21]">Dashboard & Inteligência Comercial</h2>
                <p className="text-[10px] text-[#667781]">Métricas consolidadas em tempo real direto do banco SQLite</p>
              </div>
            </div>

            {/* Controles de Filtros e Recarga */}
            <div className="flex items-center gap-2.5">
              {/* Filtro por Filial */}
              <select
                value={dashStoreFilter}
                onChange={(e) => setDashStoreFilter(e.target.value)}
                className="text-xs bg-[#f0f2f5] text-[#111b21] border border-[#e9edef] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              >
                <option value="">Todas as Filiais ({stores.length})</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Filtro por Atendente */}
              <select
                value={dashUserFilter}
                onChange={(e) => setDashUserFilter(e.target.value)}
                className="text-xs bg-[#f0f2f5] text-[#111b21] border border-[#e9edef] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              >
                <option value="">Todos Atendentes</option>
                <option value="unassigned">Não Atribuídos</option>
                {currentUser && (
                  <option value={currentUser.id}>Meus ({currentUser.name || currentUser.email})</option>
                )}
                {users.filter(u => !currentUser || u.id !== currentUser.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>

              {/* Botão de Atualizar Métricas */}
              <button
                onClick={() => fetchDashboardStats({ storeId: dashStoreFilter, assignedUserId: dashUserFilter })}
                disabled={loadingDashboardStats}
                className="p-2 bg-white hover:bg-[#f0f2f5] text-[#54656f] hover:text-[#00a884] border border-[#e9edef] rounded-lg transition-all shadow-sm"
                title="Atualizar Métricas"
              >
                <RefreshCw size={15} className={loadingDashboardStats ? 'animate-spin text-[#00a884]' : ''} />
              </button>

              {/* Botão Voltar para Conversas */}
              <button
                onClick={() => setActiveTab('chats')}
                className="px-3 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all ml-1"
              >
                <MessageSquare size={13} />
                <span>Ir para Chats</span>
              </button>
            </div>
          </header>

          {/* Conteúdo Principal do Dashboard */}
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            {loadingDashboardStats && !dashboardStats ? (
              <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-500">
                <Loader2 className="animate-spin text-[#00a884]" size={32} />
                <span className="text-xs font-medium">Carregando indicadores do banco de dados...</span>
              </div>
            ) : dashboardStats ? (
              <>
                {/* 1. CARDS DE KPI PRINCIPAIS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1: Total de Leads */}
                  <div className="bg-white p-4 rounded-2xl border border-[#e9edef] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total de Leads</p>
                      <h3 className="text-2xl font-bold text-[#111b21] mt-0.5">{dashboardStats.summary.totalChats}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-sky-700">{dashboardStats.summary.activeChats} ativos</span> • {dashboardStats.summary.archivedChats} arquivados
                      </p>
                    </div>
                  </div>

                  {/* KPI 2: Taxa de Conversão */}
                  <div className="bg-white p-4 rounded-2xl border border-[#e9edef] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taxa de Conversão</p>
                      <h3 className="text-2xl font-bold text-[#111b21] mt-0.5">{dashboardStats.summary.conversionRate}%</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-purple-700">{dashboardStats.summary.funnel.closed} contratos</span> fechados
                      </p>
                    </div>
                  </div>

                  {/* KPI 3: Em Andamento */}
                  <div className="bg-white p-4 rounded-2xl border border-[#e9edef] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Oportunidades</p>
                      <h3 className="text-2xl font-bold text-[#111b21] mt-0.5">
                        {dashboardStats.summary.funnel.negotiation + dashboardStats.summary.funnel.proposal}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {dashboardStats.summary.funnel.negotiation} negoc. • {dashboardStats.summary.funnel.proposal} propostas
                      </p>
                    </div>
                  </div>

                  {/* KPI 4: Mensagens Trocadas */}
                  <div className="bg-white p-4 rounded-2xl border border-[#e9edef] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00a884] flex items-center justify-center border border-emerald-100 shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mensagens Trocadas</p>
                      <h3 className="text-2xl font-bold text-[#111b21] mt-0.5">{dashboardStats.summary.messages.total}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-emerald-700">{dashboardStats.summary.messages.today} hoje</span> • {dashboardStats.summary.messages.sent} env / {dashboardStats.summary.messages.received} rec
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. GRÁFICOS: FUNIL COMERCIAL + ATIVIDADE ÚLTIMOS 7 DIAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Funil Visual de Conversão */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e9edef] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e9edef]">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-[#00a884]" />
                        <h4 className="text-xs font-bold text-[#111b21] uppercase tracking-wide">
                          Distribuição do Funil Comercial
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {dashboardStats.summary.activeChats} leads ativos
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { label: 'Leads Novos', count: dashboardStats.summary.funnel.lead, color: 'bg-sky-500', barBg: 'bg-sky-100', text: 'text-sky-700' },
                        { label: 'Em Negociação', count: dashboardStats.summary.funnel.negotiation, color: 'bg-amber-500', barBg: 'bg-amber-100', text: 'text-amber-700' },
                        { label: 'Proposta Enviada', count: dashboardStats.summary.funnel.proposal, color: 'bg-purple-500', barBg: 'bg-purple-100', text: 'text-purple-700' },
                        { label: 'Contrato Fechado', count: dashboardStats.summary.funnel.closed, color: 'bg-[#00a884]', barBg: 'bg-emerald-100', text: 'text-emerald-700' },
                      ].map((stage, idx) => {
                        const total = dashboardStats.summary.activeChats || 1;
                        const pct = Math.round((stage.count / total) * 100);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-700">{stage.label}</span>
                              <span className="font-bold text-[#111b21]">
                                {stage.count} <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${stage.color} transition-all duration-700 rounded-full`}
                                style={{ width: `${Math.max(pct, stage.count > 0 ? 4 : 0)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Volume de Mensagens nos Últimos 7 Dias */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e9edef] shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e9edef]">
                      <div className="flex items-center gap-2">
                        <Activity size={18} className="text-[#00a884]" />
                        <h4 className="text-xs font-bold text-[#111b21] uppercase tracking-wide">
                          Volume de Mensagens (Últimos 7 dias)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Total: {dashboardStats.summary.messages.total} msgs
                      </span>
                    </div>

                    {/* Gráfico de Barras em CSS */}
                    <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                      {dashboardStats.timeline.map((day, idx) => {
                        const maxVal = Math.max(...dashboardStats.timeline.map(d => d.count), 5);
                        const heightPct = Math.round((day.count / maxVal) * 100);

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <span className="text-[9px] font-bold text-slate-500 group-hover:text-[#00a884] transition-colors">
                              {day.count}
                            </span>
                            <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-32">
                              <div
                                className="w-full bg-[#00a884] group-hover:bg-emerald-500 transition-all rounded-t-lg"
                                style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 2)}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-medium text-slate-500 uppercase truncate max-w-full">
                              {day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. DESEMPENHO POR FILIAL & EQUIPE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Desempenho por Filial */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e9edef] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e9edef]">
                      <div className="flex items-center gap-2">
                        <Building size={18} className="text-[#00a884]" />
                        <h4 className="text-xs font-bold text-[#111b21] uppercase tracking-wide">
                          Distribuição por Filial ({dashboardStats.stores.length})
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dashboardStats.stores.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">Nenhuma filial cadastrada.</p>
                      ) : (
                        dashboardStats.stores.map((store) => (
                          <div key={store.id} className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e9edef] flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-bold text-[#111b21]">{store.name}</h5>
                              <p className="text-[10px] text-slate-500">{store.address || 'Sem endereço informado'}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] bg-sky-50 text-sky-700 font-semibold px-1.5 py-0.5 rounded">
                                  {store.operatorsCount} {store.operatorsCount === 1 ? 'operador' : 'operadores'}
                                </span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                                  {store.closedChats} fechados
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-[#111b21]">{store.totalChats}</p>
                              <p className="text-[10px] text-slate-500">{store.percentOfTotal}% do total</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Desempenho da Equipe */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e9edef] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e9edef]">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#00a884]" />
                        <h4 className="text-xs font-bold text-[#111b21] uppercase tracking-wide">
                          Produtividade da Equipe ({dashboardStats.team.length})
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dashboardStats.team.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">Nenhum atendente cadastrado.</p>
                      ) : (
                        dashboardStats.team.map((member) => (
                          <div key={member.id} className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e9edef] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {member.name ? member.name.charAt(0).toUpperCase() : <User size={14} />}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <h5 className="text-xs font-bold text-[#111b21]">{member.name}</h5>
                                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                                    member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                                  }`}>
                                    {member.role === 'ADMIN' ? 'Admin' : 'Operador'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500">{member.storeName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-[#111b21]">
                                {member.totalAssigned} <span className="text-[9px] text-slate-500 font-normal">atribuídos</span>
                              </p>
                              <p className="text-[10px] text-emerald-600 font-bold">
                                {member.closedCount} fechados ({member.conversionRate}%)
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ABA: CENTRAL DE AUTOMAÇÕES E REGRAS (Fase 08) */}
      {activeTab === 'automations' && (
        <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-[#e9edef] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#00a884]" />
                <h1 className="text-lg font-bold text-[#111b21]">
                  Central de Automações & Regras de Atendimento
                </h1>
              </div>
              <p className="text-xs text-[#667781] mt-0.5">
                Respostas automáticas reais disparadas pelo motor Baileys diretamente aos contatos do WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {automationSavedAlert && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg shadow-sm animate-fade-in">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>{automationSavedAlert}</span>
                </div>
              )}
              <button
                onClick={() => fetchAutomations()}
                disabled={loadingAutomations}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d1d7db] text-xs font-semibold text-[#54656f] hover:bg-[#f0f2f5] transition-colors"
                title="Recarregar regras"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAutomations ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CARD 1: MENSAGEM DE BOAS-VINDAS */}
              <div className="bg-white rounded-2xl border border-[#e9edef] p-6 shadow-sm flex flex-col justify-between hover:border-[#00a884]/40 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#f0f2f5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00a884] flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#111b21]">Mensagem de Boas-Vindas</h2>
                        <p className="text-[11px] text-[#667781]">
                          Enviada no primeiro contato de um novo cliente/lead
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={welcomeForm.enabled}
                        onChange={(e) => setWelcomeForm(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111b21] flex items-center justify-between">
                      <span>Texto da Mensagem</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        welcomeForm.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {welcomeForm.enabled ? 'Regra Ativa' : 'Desativada'}
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={welcomeForm.message}
                      onChange={(e) => setWelcomeForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Olá! Seja bem-vindo à Shineray do Brasil. Como posso te ajudar hoje?"
                      className="w-full text-xs p-3 rounded-xl border border-[#d1d7db] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none text-[#111b21] placeholder:text-slate-400 resize-none transition-all"
                    />
                  </div>

                  <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e9edef] text-[11px] text-[#667781] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#111b21]">
                      <Clock className="w-3.5 h-3.5 text-[#00a884]" />
                      <span>Comportamento do Motor:</span>
                    </div>
                    <p>
                      Disparo automático executado 1.5s após a chegada da primeira mensagem (messages.upsert) do novo lead, simulando digitação humana.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0f2f5] mt-6 flex justify-end">
                  <button
                    onClick={handleSaveWelcome}
                    disabled={savingAutomationType === 'WELCOME'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {savingAutomationType === 'WELCOME' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Boas-Vindas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 2: FORA DO HORÁRIO COMERCIAL */}
              <div className="bg-white rounded-2xl border border-[#e9edef] p-6 shadow-sm flex flex-col justify-between hover:border-[#00a884]/40 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#f0f2f5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#111b21]">Horário de Atendimento</h2>
                        <p className="text-[11px] text-[#667781]">
                          Aviso automático enviado fora do expediente das concessionárias
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outOfHoursForm.enabled}
                        onChange={(e) => setOutOfHoursForm(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
                    </label>
                  </div>

                  {/* Horários de Início e Fim */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#667781] block mb-1">
                        Início do Expediente
                      </label>
                      <select
                        value={outOfHoursForm.startHour}
                        onChange={(e) => setOutOfHoursForm(prev => ({ ...prev, startHour: parseInt(e.target.value, 10) }))}
                        className="w-full text-xs p-2 rounded-xl border border-[#d1d7db] bg-white text-[#111b21] font-semibold focus:border-[#00a884] outline-none"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')}:00h
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#667781] block mb-1">
                        Fim do Expediente
                      </label>
                      <select
                        value={outOfHoursForm.endHour}
                        onChange={(e) => setOutOfHoursForm(prev => ({ ...prev, endHour: parseInt(e.target.value, 10) }))}
                        className="w-full text-xs p-2 rounded-xl border border-[#d1d7db] bg-white text-[#111b21] font-semibold focus:border-[#00a884] outline-none"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')}:00h
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dias da Semana */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#667781] block mb-1.5">
                      Dias de Atendimento (Expediente Aberto)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { num: 1, label: 'Seg' },
                        { num: 2, label: 'Ter' },
                        { num: 3, label: 'Qua' },
                        { num: 4, label: 'Qui' },
                        { num: 5, label: 'Sex' },
                        { num: 6, label: 'Sáb' },
                        { num: 0, label: 'Dom' },
                      ].map(day => {
                        const isSelected = (outOfHoursForm.workDays || '')
                          .split(',')
                          .map(s => s.trim())
                          .includes(String(day.num));
                        return (
                          <button
                            key={day.num}
                            type="button"
                            onClick={() => toggleWorkDay(day.num)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                              isSelected
                                ? 'bg-[#00a884] text-white border-[#00a884]'
                                : 'bg-[#f8f9fa] text-slate-500 border-[#e9edef] hover:border-slate-300'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111b21] flex items-center justify-between">
                      <span>Mensagem de Ausência</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        outOfHoursForm.enabled ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {outOfHoursForm.enabled ? 'Regra Ativa' : 'Desativada'}
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={outOfHoursForm.message}
                      onChange={(e) => setOutOfHoursForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Olá! Agradecemos o contato. Nosso atendimento funciona de segunda a sexta, das 08h às 18h. Responderemos em breve!"
                      className="w-full text-xs p-3 rounded-xl border border-[#d1d7db] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none text-[#111b21] placeholder:text-slate-400 resize-none transition-all"
                    />
                  </div>

                  <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e9edef] text-[11px] text-[#667781] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#111b21]">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Proteção Anti-Flood Ativa (12h):</span>
                    </div>
                    <p>
                      O sistema armazena o timestamp do último disparo (lastAutoReplyTime) e só envia uma resposta de ausência a cada 12 horas por contato.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0f2f5] mt-6 flex justify-end">
                  <button
                    onClick={handleSaveOutOfHours}
                    disabled={savingAutomationType === 'OUT_OF_HOURS'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {savingAutomationType === 'OUT_OF_HOURS' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Horário</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* CARD 3: AUDITORIA E ARQUITETURA DO MOTOR */}
            <div className="bg-white rounded-2xl border border-[#e9edef] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111b21]">
                    Arquitetura Full-Stack: Baileys WebSocket + SQLite Transacional
                  </h4>
                  <p className="text-[11px] text-[#667781]">
                    Todas as regras são consultadas dinamicamente no banco dev.db pelo backend em cada mensagem recebida, garantindo execução mesmo sem tela aberta.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Motor Server-Side Ativo
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÃO DE INTELIGÊNCIA ARTIFICIAL (Fase 09) */}
      {showAiSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-[#111b21]">
            
            {/* Header */}
            <div className="bg-[#f0f2f5] p-5 flex items-center justify-between border-b border-[#e9edef] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111b21]">Configurações do Copiloto IA</h3>
                  <p className="text-[11px] text-[#667781]">
                    Integração real via API oficial (Google Gemini ou OpenAI)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAiSettingsModal(false);
                  setTestAiResult(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-black transition-colors"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAiConfig} className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
              
              {/* Feedback Alerts */}
              {aiSavedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Configurações do Copiloto salvas com sucesso no banco de dados!</span>
                </div>
              )}

              {testAiResult && (
                <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 animate-fade-in ${
                  testAiResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testAiResult.success ? (
                    <CheckCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">
                      {testAiResult.success ? 'Conexão validada com sucesso!' : 'Falha no teste de conexão:'}
                    </p>
                    <p className="text-[11px]">
                      {testAiResult.success ? (testAiResult.message || 'API respondeu corretamente.') : testAiResult.error}
                    </p>
                  </div>
                </div>
              )}

              {/* Ativação Geral */}
              <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#e9edef]">
                <div>
                  <h4 className="text-xs font-bold text-[#111b21]">Habilitar Copiloto no Chat</h4>
                  <p className="text-[11px] text-[#667781]">
                    Permite que atendentes consultem sugestões de resposta e melhorias de texto
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiForm.enabled}
                    onChange={(e) => setAiForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Provedor de IA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111b21]">Provedor de IA</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAiForm(prev => ({
                      ...prev,
                      provider: 'gemini',
                      model: 'gemini-1.5-flash'
                    }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiForm.provider === 'gemini'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                        : 'border-[#d1d7db] hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111b21]">Google Gemini</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[10px] text-[#667781] mt-1">
                      Altíssima velocidade, chave gratuita no AI Studio e excelente em português.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiForm(prev => ({
                      ...prev,
                      provider: 'openai',
                      model: 'gpt-4o-mini'
                    }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiForm.provider === 'openai'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                        : 'border-[#d1d7db] hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111b21]">OpenAI</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        GPT-4o
                      </span>
                    </div>
                    <p className="text-[10px] text-[#667781] mt-1">
                      Modelos consagrados GPT-4o e GPT-4o-mini via API oficial OpenAI.
                    </p>
                  </button>
                </div>
              </div>

              {/* Chave de API */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111b21]">Chave de API (`API Key`)</label>
                  {aiConfig?.hasApiKey && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check size={12} /> Chave salva: {aiConfig.maskedKey}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={aiForm.apiKey}
                    onChange={(e) => setAiForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={
                      aiConfig?.hasApiKey
                        ? "Chave salva ativa. Deixe em branco ou digite uma nova para alterar."
                        : aiForm.provider === 'openai'
                        ? "Cole sua chave da OpenAI (sk-...)"
                        : "Cole sua chave do Google Gemini (AIzaSy...)"
                    }
                    className="w-full text-xs p-3 pr-10 rounded-xl border border-[#d1d7db] focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-[#111b21]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyText(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showApiKeyText ? "Ocultar" : "Exibir"}
                  >
                    {showApiKeyText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#667781]">
                  {aiForm.provider === 'openai'
                    ? "Gere sua chave em platform.openai.com/api-keys"
                    : "Gere sua chave gratuita em aistudio.google.com/app/apikey"}
                </p>
              </div>

              {/* Modelo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111b21]">Modelo LLM</label>
                <select
                  value={aiForm.model}
                  onChange={(e) => setAiForm(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d1d7db] bg-white text-[#111b21] font-semibold focus:border-purple-600 outline-none"
                >
                  {aiForm.provider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Padrão recomendado - Mais rápido)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Avançado - Alta precisão comercial)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Nova geração ultrarrápida)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">GPT-4o Mini (Padrão recomendado - Ágil e econômico)</option>
                      <option value="gpt-4o">GPT-4o (Avançado - Máxima capacidade de raciocínio)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Instruções do Sistema */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111b21]">
                  Instruções do Sistema (Persona Comercial)
                </label>
                <textarea
                  rows={3}
                  value={aiForm.systemPrompt}
                  onChange={(e) => setAiForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Você é o Copiloto Comercial da Shineray..."
                  className="w-full text-xs p-3 rounded-xl border border-[#d1d7db] focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-[#111b21] resize-none"
                />
              </div>

              {/* Temperatura */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#111b21]">Temperatura / Criatividade</label>
                  <span className="font-semibold text-purple-700">{aiForm.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={aiForm.temperature}
                  onChange={(e) => setAiForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#667781]">
                  <span>0.1 (Mais preciso/direto)</span>
                  <span>1.0 (Mais criativo)</span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#f0f2f5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestAiKey}
                  disabled={testingAiKey || (!aiForm.apiKey && !aiConfig?.hasApiKey)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d1d7db] hover:bg-[#f0f2f5] text-xs font-semibold text-[#54656f] transition-colors disabled:opacity-40"
                >
                  {testingAiKey ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-purple-600" />
                      <span>Testando Conexão...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="text-purple-600" />
                      <span>Testar Conexão</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAiSettingsModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#54656f] hover:bg-[#f0f2f5] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingAiConfig}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {savingAiConfig ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Salvar Configurações</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: TUTORIAL INTERATIVO E DINÂMICO (Tema White / Light Mode) */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-[#111b21]">
            
            {/* Header */}
            <div className="bg-[#f0f2f5] p-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
              <div className="flex items-center gap-2.5 text-[#00a884]">
                <PixelLoomLogo size={20} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Guia Interativo de Operação</h3>
              </div>
              <button 
                onClick={() => setShowTutorialModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-black transition-colors"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Slider de Passos do Tutorial Dinâmico */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between space-y-6 bg-white">
              
              {/* SLIDE 0: Conexão WhatsApp */}
              {tutorialStep === 0 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                  <div className="border border-[#e9edef] bg-[#f8f9fa] rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px]">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#00a884]/10 border border-[#00a884]/30 flex items-center justify-center text-[#00a884]">
                        <MessageSquare size={32} />
                      </div>
                      <ChevronRight size={20} className="text-[#00a884]" />
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#e9edef] shadow-sm flex items-center justify-center text-slate-700">
                        <PixelLoomLogo size={32} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center px-4">
                    <h4 className="text-sm font-bold text-[#00a884]">Conexão Segura com WhatsApp</h4>
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Pareie seu aparelho escaneando o código QR diretamente no CRM ou acesse a rota dedicada <strong className="text-slate-700">/conectar</strong> para realizar o pareamento em outro dispositivo. A conexão é mantida de forma persistente pelo servidor Baileys.
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 1: Funil Comercial */}
              {tutorialStep === 1 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                  <div className="border border-[#e9edef] bg-[#f8f9fa] rounded-xl p-5 flex flex-col justify-center space-y-2 min-h-[160px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold text-center">
                        1. Leads
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold text-center">
                        2. Em Negociação
                      </div>
                      <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold text-center">
                        3. Proposta Enviada
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
                        4. Contrato Fechado
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-center px-4">
                    <h4 className="text-sm font-bold text-[#00a884]">Funil Comercial & Pipeline</h4>
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Acompanhe e classifique o status de cada lead ao longo da jornada de compra. A etapa comercial é salva diretamente no banco de dados SQLite e sincronizada em tempo real com toda a equipe de atendimento.
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Tags & Anotações */}
              {tutorialStep === 2 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                  <div className="border border-[#e9edef] bg-[#f8f9fa] rounded-xl p-5 flex flex-col justify-center space-y-3 min-h-[160px]">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#e9edef] text-[10px] font-bold text-slate-700 uppercase shadow-sm">
                        # Shineray Jet 125
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#e9edef] text-[10px] font-bold text-slate-700 uppercase shadow-sm">
                        # Entrada PIX
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#e9edef] text-[10px] font-bold text-slate-700 uppercase shadow-sm">
                        # Visita Agendada
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#e9edef] text-[11px] text-slate-600 italic text-center shadow-sm">
                      "Cliente prefere contato após as 14h para simulação de financiamento."
                    </div>
                  </div>

                  <div className="space-y-2 text-center px-4">
                    <h4 className="text-sm font-bold text-[#00a884]">Tags & Anotações de Atendimento</h4>
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Organize contatos com tags personalizadas e registre anotações detalhadas de cada negociação na ficha lateral do cliente. Todo o histórico fica salvo e vinculado ao número de telefone.
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 3: Sincronização de Histórico */}
              {tutorialStep === 3 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                  <div className="border border-[#e9edef] bg-[#f8f9fa] rounded-xl p-5 flex flex-col justify-center items-center space-y-3 min-h-[160px]">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00a884]">
                      <Database size={28} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Persistência Local em SQLite</span>
                  </div>

                  <div className="space-y-2 text-center px-4">
                    <h4 className="text-sm font-bold text-[#00a884]">Sincronização & Histórico Paginado</h4>
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Suas mensagens são recebidas via WebSocket e salvas no banco de dados local. Ao abrir conversas antigas, utilize a paginação para carregar mensagens anteriores sob demanda com alta velocidade e confiabilidade.
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Arquivamento & Segurança */}
              {tutorialStep === 4 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
                  <div className="border border-[#e9edef] bg-[#f8f9fa] rounded-xl p-5 flex flex-col justify-center items-center space-y-3 min-h-[160px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <FolderArchive size={24} />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                        <Lock size={24} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Organização e Autenticação JWT</span>
                  </div>

                  <div className="space-y-2 text-center px-4">
                    <h4 className="text-sm font-bold text-[#00a884]">Arquivamento & Segurança</h4>
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Mantenha sua lista limpa arquivando chats finalizados. Todas as operações são protegidas por autenticação JWT com senhas criptografadas em hash bcrypt no banco de dados.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer e Controles de Navegação */}
              <div className="border-t border-[#e9edef] pt-4 flex flex-col space-y-3 shrink-0 bg-white">
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <span 
                      key={step} 
                      onClick={() => setTutorialStep(step)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                        tutorialStep === step ? 'bg-[#00a884] w-4' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    disabled={tutorialStep === 0}
                    onClick={() => setTutorialStep(prev => prev - 1)}
                    className="px-4 py-1.5 bg-[#f0f2f5] border border-[#e9edef] text-[#667781] hover:bg-[#eae6df] text-xs font-semibold rounded-lg disabled:opacity-30 transition-all active:scale-95"
                  >
                    Anterior
                  </button>

                  {tutorialStep === 4 ? (
                    <button
                      onClick={() => setShowTutorialModal(false)}
                      className="px-5 py-1.5 bg-[#00a884] hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 border border-transparent"
                    >
                      Concluir Guia
                    </button>
                  ) : (
                    <button
                      onClick={() => setTutorialStep(prev => prev + 1)}
                      className="px-5 py-1.5 bg-[#f0f2f5] border border-[#e9edef] text-[#00a884] hover:bg-[#eae6df] text-xs font-bold rounded-lg transition-all active:scale-95"
                    >
                      Avançar
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO DE DESCONEXÃO DO WHATSAPP */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e9edef] rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl text-[#111b21]">
            
            <div className="bg-[#f0f2f5] p-4 flex items-center justify-between border-b border-[#e9edef]">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert size={18} />
                <span>Desconectar Dispositivo</span>
              </div>
              <button 
                onClick={() => setShowDisconnectConfirm(false)}
                className="text-slate-400 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Tem certeza?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A sessão do WhatsApp será desconectada. As mensagens sincronizadas e dados de CRM permanecerão salvos com segurança no banco de dados local.
                </p>
              </div>
              <div className="text-[10px] text-slate-500 bg-[#f0f2f5] p-2.5 rounded border border-[#e9edef] leading-relaxed text-left">
                💡 Para reconectar a qualquer momento, basta escanear o novo QR Code gerado pelo sistema.
              </div>
            </div>

            <div className="bg-[#f0f2f5] p-3 flex justify-end gap-2 border-t border-[#e9edef]">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-[#f5f6f6] text-xs font-semibold text-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisconnectWhatsApp}
                className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors border border-transparent"
              >
                Sim, Desconectar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: LIGHTBOX DE IMAGENS (Fundo escuro preservado para visualização ideal da foto) */}
      {selectedImagePreview && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col justify-center items-center">
            <button 
              onClick={() => setSelectedImagePreview(null)}
              className="absolute -top-12 right-0 p-2 text-[#8696a0] hover:text-white bg-[#202c33]/80 rounded-full border border-[#222e35] transition-colors"
              title="Fechar"
            >
              <X size={20} />
            </button>
            <img 
              src={selectedImagePreview} 
              alt="Mídia WhatsApp" 
              className="rounded-lg object-contain max-w-full max-h-[80vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="mt-4 bg-[#202c33] border border-[#222e35] rounded-xl px-4 py-2 text-xs font-semibold text-slate-300">
              Visualizador de Mídias Shineray CRM
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GESTÃO DE FILIAIS E EQUIPE DE ATENDIMENTO (Fase 05 - Multi-usuário Real) */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl text-[#111b21]">
            
            {/* Header */}
            <div className="bg-[#f0f2f5] p-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a884]/10 text-[#00a884] flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Gestão de Filiais & Equipe</h3>
                  <p className="text-[10px] text-[#667781]">Configuração multi-loja e permissões de atendentes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentUser?.role === 'ADMIN' ? (
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                    Administrador
                  </span>
                ) : (
                  <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                    Operador
                  </span>
                )}
                <button 
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-black transition-colors"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Abas */}
            <div className="flex border-b border-[#e9edef] bg-white px-4 shrink-0">
              <button
                onClick={() => {
                  setTeamTab('stores');
                  setShowStoreForm(false);
                  setTeamMsg({ type: '', text: '' });
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  teamTab === 'stores'
                    ? 'border-[#00a884] text-[#00a884]'
                    : 'border-transparent text-[#667781] hover:text-[#111b21]'
                }`}
              >
                <Building size={15} />
                <span>Filiais & Lojas ({stores.length})</span>
              </button>
              <button
                onClick={() => {
                  setTeamTab('users');
                  setShowUserForm(false);
                  setTeamMsg({ type: '', text: '' });
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  teamTab === 'users'
                    ? 'border-[#00a884] text-[#00a884]'
                    : 'border-transparent text-[#667781] hover:text-[#111b21]'
                }`}
              >
                <Users size={15} />
                <span>Atendentes & Equipe ({users.length})</span>
              </button>
            </div>

            {/* Mensagem de Feedback */}
            {teamMsg.text && (
              <div className={`mx-6 mt-4 p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                teamMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span>{teamMsg.text}</span>
                <button onClick={() => setTeamMsg({ type: '', text: '' })} className="text-slate-400 hover:text-black">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Conteúdo das Abas */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#f8f9fa] space-y-4">

              {/* ABA 1: FILIAIS */}
              {teamTab === 'stores' && (
                <div>
                  {showStoreForm ? (
                    <div className="bg-white p-5 rounded-xl border border-[#e9edef] shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#e9edef]">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {storeForm.id ? 'Editar Filial' : 'Cadastrar Nova Filial'}
                        </h4>
                        <button 
                          onClick={() => setShowStoreForm(false)}
                          className="text-slate-400 hover:text-black text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Nome da Unidade *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Shineray Matriz, Filial Zona Sul..."
                            value={storeForm.name}
                            onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Endereço / Localização
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Av. Principal, 1000 - Centro"
                            value={storeForm.address}
                            onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Telefone / WhatsApp da Loja
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: (81) 98888-7777"
                            value={storeForm.phone}
                            onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setShowStoreForm(false)}
                          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={teamLoading || !storeForm.name.trim()}
                          onClick={async () => {
                            setTeamLoading(true);
                            setTeamMsg({ type: '', text: '' });
                            if (storeForm.id) {
                              const res = await updateStore(storeForm.id, { name: storeForm.name, address: storeForm.address, phone: storeForm.phone });
                              if (res.success) {
                                setTeamMsg({ type: 'success', text: 'Filial atualizada com sucesso!' });
                                setShowStoreForm(false);
                              } else {
                                setTeamMsg({ type: 'error', text: res.error || 'Erro ao atualizar filial' });
                              }
                            } else {
                              const res = await createStore({ name: storeForm.name, address: storeForm.address, phone: storeForm.phone });
                              if (res.success) {
                                setTeamMsg({ type: 'success', text: 'Filial criada com sucesso!' });
                                setShowStoreForm(false);
                              } else {
                                setTeamMsg({ type: 'error', text: res.error || 'Erro ao criar filial' });
                              }
                            }
                            setTeamLoading(false);
                          }}
                          className="px-5 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          {teamLoading && <Loader2 size={13} className="animate-spin" />}
                          Salvar Filial
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                          Filiais ativas onde as conversas e leads podem ser distribuídos.
                        </p>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              setStoreForm({ id: null, name: '', address: '', phone: '' });
                              setShowStoreForm(true);
                            }}
                            className="px-3 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Plus size={14} />
                            Nova Filial
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {stores.map((store) => {
                          const chatCount = chats.filter(c => c.storeId === store.id).length;
                          const userCount = users.filter(u => u.storeId === store.id).length;

                          return (
                            <div 
                              key={store.id}
                              className="bg-white p-4 rounded-xl border border-[#e9edef] shadow-sm flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Building size={16} className="text-[#00a884]" />
                                  <h4 className="text-xs font-bold text-[#111b21]">{store.name}</h4>
                                </div>
                                {store.address && (
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <MapPin size={11} className="text-slate-400" />
                                    {store.address}
                                  </p>
                                )}
                                {store.phone && (
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone size={11} className="text-slate-400" />
                                    {store.phone}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                                    {chatCount} {chatCount === 1 ? 'conversa' : 'conversas'}
                                  </span>
                                  <span className="text-[9px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-semibold">
                                    {userCount} {userCount === 1 ? 'atendente' : 'atendentes'}
                                  </span>
                                </div>
                              </div>

                              {currentUser?.role === 'ADMIN' && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setStoreForm({ id: store.id, name: store.name, address: store.address || '', phone: store.phone || '' });
                                      setShowStoreForm(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-[#00a884] hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Editar Filial"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Deseja excluir a filial "${store.name}"? Conversas vinculadas perderão o vínculo com esta loja.`)) {
                                        setTeamLoading(true);
                                        const res = await deleteStore(store.id);
                                        if (res.success) {
                                          setTeamMsg({ type: 'success', text: 'Filial excluída com sucesso!' });
                                        } else {
                                          setTeamMsg({ type: 'error', text: res.error || 'Erro ao excluir filial' });
                                        }
                                        setTeamLoading(false);
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Excluir Filial"
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: ATENDENTES & EQUIPE */}
              {teamTab === 'users' && (
                <div>
                  {showUserForm ? (
                    <div className="bg-white p-5 rounded-xl border border-[#e9edef] shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#e9edef]">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {userForm.id ? 'Editar Atendente' : 'Cadastrar Novo Atendente'}
                        </h4>
                        <button 
                          onClick={() => setShowUserForm(false)}
                          className="text-slate-400 hover:text-black text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: João da Silva"
                            value={userForm.name}
                            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Email de Acesso *
                          </label>
                          <input
                            type="email"
                            placeholder="Ex: operador@shineray.com"
                            value={userForm.email}
                            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Senha {userForm.id ? '(deixe em branco para não alterar)' : '*'}
                          </label>
                          <input
                            type="password"
                            placeholder={userForm.id ? 'Nova senha (opcional)' : 'Senha de acesso (mínimo 6 caracteres)'}
                            value={userForm.password}
                            onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Nível de Acesso
                            </label>
                            <select
                              value={userForm.role}
                              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                            >
                              <option value="OPERATOR">Operador</option>
                              <option value="ADMIN">Administrador</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Filial Vinculada
                            </label>
                            <select
                              value={userForm.storeId || ''}
                              onChange={(e) => setUserForm(prev => ({ ...prev, storeId: e.target.value }))}
                              className="w-full bg-[#f0f2f5] border border-[#e9edef] rounded-lg px-3 py-2 text-xs text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                            >
                              <option value="">Sem filial vinculada</option>
                              {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {userForm.id && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="user-active-checkbox"
                              checked={userForm.active}
                              onChange={(e) => setUserForm(prev => ({ ...prev, active: e.target.checked }))}
                              className="rounded text-[#00a884] focus:ring-[#00a884]"
                            />
                            <label htmlFor="user-active-checkbox" className="text-xs font-semibold text-slate-700">
                              Usuário Ativo (pode fazer login no CRM)
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setShowUserForm(false)}
                          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={teamLoading || !userForm.name.trim() || !userForm.email.trim() || (!userForm.id && !userForm.password)}
                          onClick={async () => {
                            setTeamLoading(true);
                            setTeamMsg({ type: '', text: '' });
                            if (userForm.id) {
                              const payload = {
                                name: userForm.name,
                                email: userForm.email,
                                role: userForm.role,
                                storeId: userForm.storeId || null,
                                active: userForm.active
                              };
                              if (userForm.password) payload.password = userForm.password;
                              const res = await updateUser(userForm.id, payload);
                              if (res.success) {
                                setTeamMsg({ type: 'success', text: 'Atendente atualizado com sucesso!' });
                                setShowUserForm(false);
                              } else {
                                setTeamMsg({ type: 'error', text: res.error || 'Erro ao atualizar atendente' });
                              }
                            } else {
                              const res = await createUser({
                                name: userForm.name,
                                email: userForm.email,
                                password: userForm.password,
                                role: userForm.role,
                                storeId: userForm.storeId || null
                              });
                              if (res.success) {
                                setTeamMsg({ type: 'success', text: 'Atendente criado com sucesso!' });
                                setShowUserForm(false);
                              } else {
                                setTeamMsg({ type: 'error', text: res.error || 'Erro ao criar atendente' });
                              }
                            }
                            setTeamLoading(false);
                          }}
                          className="px-5 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          {teamLoading && <Loader2 size={13} className="animate-spin" />}
                          Salvar Atendente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                          Membros da equipe que podem atender conversas e gerenciar o CRM.
                        </p>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              setUserForm({ id: null, name: '', email: '', password: '', role: 'OPERATOR', storeId: stores[0]?.id || '', active: true });
                              setShowUserForm(true);
                            }}
                            className="px-3 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <UserPlus size={14} />
                            Novo Atendente
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {users.map((user) => {
                          const assignedChatsCount = chats.filter(c => c.assignedUserId === user.id).length;
                          const userStore = stores.find(s => s.id === user.storeId);

                          return (
                            <div 
                              key={user.id}
                              className="bg-white p-4 rounded-xl border border-[#e9edef] shadow-sm flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                  {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-[#111b21]">{user.name}</h4>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-sky-100 text-sky-700 border border-sky-200'
                                    }`}>
                                      {user.role === 'ADMIN' ? 'Admin' : 'Operador'}
                                    </span>
                                    {user.active === false && (
                                      <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">
                                        Inativo
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500">{user.email}</p>
                                  <div className="flex items-center gap-2 pt-1">
                                    {userStore && (
                                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                        <Building size={9} />
                                        {userStore.name}
                                      </span>
                                    )}
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                                      {assignedChatsCount} {assignedChatsCount === 1 ? 'conversa atribuída' : 'conversas atribuídas'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {currentUser?.role === 'ADMIN' && (
                                <button
                                  onClick={() => {
                                    setUserForm({
                                      id: user.id,
                                      name: user.name,
                                      email: user.email,
                                      password: '',
                                      role: user.role,
                                      storeId: user.storeId || '',
                                      active: user.active !== false
                                    });
                                    setShowUserForm(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-[#00a884] hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Editar Atendente"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
