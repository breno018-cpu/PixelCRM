// frontend/src/design-system/tokens.js
// Design Tokens Oficiais do PixelCRM Shineray (PROMPT 04 - ETAPA 01)
// Inspirados na ergonomia e densidade de mensageria moderna (WhatsApp Web)

export const TOKENS = {
  colors: {
    // Cores Primárias da Marca Shineray / PixelLoom
    brand: {
      primary: '#00a884',
      primaryDark: '#008069',
      primaryLight: '#25d366',
      primarySubtle: '#e7f8f4',
      hover: '#008f6f',
      accent: '#53bdeb',
      purple: '#7c3aed',
      purpleSubtle: '#f5f3ff'
    },

    // Superfícies (Light Mode)
    light: {
      surfaceApp: '#eae6df',           // Fundo da aplicação
      surfaceHeader: '#f0f2f5',        // Header e barras de ferramentas
      surfaceSidebar: '#ffffff',       // Barra lateral e lista de chats
      surfaceChat: '#efeae2',          // Fundo com papel de parede do chat
      surfaceActive: '#f0f2f5',        // Item ativo/selecionado
      surfaceHover: '#f5f6f6',         // Hover de lista
      surfaceInput: '#ffffff',         // Input de texto
      surfaceDrawer: '#ffffff',        // Painel CRM contextual
      bubbleIn: '#ffffff',             // Balão recebido (cliente)
      bubbleOut: '#d9fdd3',            // Balão enviado (atendente)
      textPrimary: '#111b21',          // Texto principal
      textSecondary: '#667781',        // Texto secundário e timestamps
      textMuted: '#8696a0',            // Texto atenuado/placeholders
      borderDefault: '#e9edef',        // Linhas divisórias sutis
      borderStrong: '#d1d7db',         // Bordas de inputs e caixas
      shadowSm: '0 1px 0.5px rgba(11,20,26,0.13)',
      shadowMd: '0 2px 5px rgba(11,20,26,0.18)'
    },

    // Superfícies (Dark Mode)
    dark: {
      surfaceApp: '#0c1317',
      surfaceHeader: '#202c33',
      surfaceSidebar: '#111b21',
      surfaceChat: '#0b141a',
      surfaceActive: '#2a3942',
      surfaceHover: '#202c33',
      surfaceInput: '#2a3942',
      surfaceDrawer: '#111b21',
      bubbleIn: '#202c33',
      bubbleOut: '#005c4b',
      textPrimary: '#e9edef',
      textSecondary: '#8696a0',
      textMuted: '#667781',
      borderDefault: '#222d34',
      borderStrong: '#374248',
      shadowSm: '0 1px 0.5px rgba(0,0,0,0.3)',
      shadowMd: '0 2px 5px rgba(0,0,0,0.45)'
    },

    // Status do Funil Comercial
    funnel: {
      LEAD: {
        label: 'Lead Novo',
        color: '#0284c7',
        bgLight: '#e0f2fe',
        bgDark: '#082f49',
        borderLight: '#bae6fd',
        borderDark: '#0369a1'
      },
      NEGOTIATION: {
        label: 'Em Negociação',
        color: '#d97706',
        bgLight: '#fef3c7',
        bgDark: '#451a03',
        borderLight: '#fde68a',
        borderDark: '#b45309'
      },
      PROPOSAL: {
        label: 'Proposta Enviada',
        color: '#7c3aed',
        bgLight: '#ede9fe',
        bgDark: '#2e1065',
        borderLight: '#ddd6fe',
        borderDark: '#6d28d9'
      },
      CLOSED: {
        label: 'Contrato Fechado',
        color: '#00a884',
        bgLight: '#dcfce7',
        bgDark: '#052e16',
        borderLight: '#bbf7d0',
        borderDark: '#15803d'
      }
    },

    // Status do Motor WhatsApp
    status: {
      connected: '#00a884',
      connecting: '#d97706',
      disconnected: '#ef4444',
      qr: '#0284c7'
    }
  },

  // Sistema de Espaçamento e Dimensões
  layout: {
    sidebarWidth: '64px',
    conversationsWidth: '380px',
    crmDrawerWidth: '360px',
    headerHeight: '60px',
    composerMinHeight: '62px'
  },

  // Raios de Borda
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
    bubble: '8px'
  },

  // Tipografia (Tamanhos e Pesos)
  typography: {
    title: 'text-sm font-semibold tracking-normal',
    name: 'text-[15px] font-medium leading-snug',
    message: 'text-[14px] leading-relaxed',
    preview: 'text-[13px] leading-tight text-slate-500',
    meta: 'text-[11px] leading-tight',
    badge: 'text-[10px] font-bold uppercase tracking-wider'
  }
};
