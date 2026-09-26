// Servidor principal SiteShineray CRM
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initWhatsApp, getConnectionStatus, logoutWhatsApp, sendMessage, sendProductMessage, getWASocket, toggleArchiveChat } from './whatsapp.js';
import { prisma } from './db.js';
import { authenticateToken, requireRole, generateToken } from './auth.js';
import { ensureDefaultAdmin } from './initAdmin.js';
import { testAiConnection, generateCopilotSuggestion } from './aiService.js';
import { corporateRouter } from './corporateRoutes.js';


dotenv.config();

const app = express();
const server = createServer(app);

// Configuração controlada de CORS (Segurança Fase 01)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (como mobile apps ou curl) ou se bater com padrões locais/configurados
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.includes('192.168.') ||
      origin.includes('10.') ||
      origin.includes('172.') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app');

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada por segurança: ${origin}`);
      return callback(new Error('Origem não autorizada pela política de segurança CORS.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- ROTAS PÚBLICAS DE CONEXÃO E AUTENTICAÇÃO ---

/**
 * Status da conexão Baileys (Público para tela de QR Code externa)
 */
app.get('/api/status', (req, res) => {
  try {
    const status = getConnectionStatus();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Login Real de Operador com bcrypt e JWT
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciais inválidas ou operador inativo.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu login e senha.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth API] Erro ao realizar login:', error);
    return res.status(500).json({ error: 'Erro interno ao processar autenticação.' });
  }
});

/**
 * Retorna dados do usuário atualmente autenticado
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});

/**
 * Envia um card de produto diretamente para uma conversa ativa via WhatsApp
 */
app.post('/api/products/:id/send-whatsapp', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat de destino é obrigatório.' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado no catálogo.' });
    }

    const message = await sendProductMessage(chatId, product, req.user?.id);
    return res.json({ success: true, message });
  } catch (error) {
    console.error('[API] Erro ao enviar produto no WhatsApp:', error);
    return res.status(500).json({ error: error.message || 'Erro ao enviar card do produto.' });
  }
});

// Registra todas as rotas corporativas do Prompt 05 (Empresas, Lojas, Equipes, Cargos, Permissões, Usuários, Catálogo, CRM e Auditoria)
app.use('/api', corporateRouter);


// --- ROTAS DO WHATSAPP (SESSÃO) ---

/**
 * Desconecta o WhatsApp com segurança (não apaga os dados do CRM)
 */
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    await logoutWhatsApp();
    return res.json({ success: true, message: 'WhatsApp desconectado com sucesso. Mensagens preservadas.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Rota mantida para retrocompatibilidade segura: desconecta WhatsApp sem apagar mensagens
 */
app.post('/api/disconnect', authenticateToken, async (req, res) => {
  try {
    await logoutWhatsApp();
    io.emit('whatsapp:disconnected');
    return res.json({ success: true, message: 'WhatsApp desconectado com sucesso.' });
  } catch (error) {
    console.error('[API] Erro ao desconectar:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Operação Administrativa Restrita: Apaga todas as mensagens e chats locais mediante confirmação de senha
 */
app.post('/api/admin/reset-database', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ error: 'A confirmação de senha administrativa é obrigatória.' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(confirmPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha administrativa incorreta. Operação cancelada.' });
    }

    // Executa a limpeza apenas após validação estrita
    await prisma.message.deleteMany({});
    await prisma.chat.deleteMany({});

    io.emit('chats:cleared');
    console.warn(`[Segurança] Banco de dados limpo pelo administrador: ${req.user.email}`);

    return res.json({ success: true, message: 'Banco de dados de conversas reinicializado com sucesso.' });
  } catch (error) {
    console.error('[API Admin] Erro ao resetar banco:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- ROTAS PROTEGIDAS DO CRM E CONVERSAS ---

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { search, funnelStage, tag, archived, storeId, assignedUserId } = req.query;
    const whereClause = {};

    if (archived === 'true') {
      whereClause.isArchived = true;
    } else {
      whereClause.isArchived = false;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { lastMessageText: { contains: search } }
      ];
    }

    if (funnelStage) {
      whereClause.funnelStage = funnelStage;
    }

    if (tag) {
      whereClause.tags = { contains: tag };
    }

    if (storeId) {
      whereClause.storeId = storeId;
    }

    if (assignedUserId) {
      if (assignedUserId === 'unassigned') {
        whereClause.assignedUserId = null;
      } else {
        whereClause.assignedUserId = assignedUserId;
      }
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      include: {
        store: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        lastMessageTime: 'desc'
      }
    });

    return res.json(chats);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/chats/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { archive } = req.body;
    
    if (archive === undefined) {
      return res.status(400).json({ error: 'O parâmetro archive (true/false) é obrigatório.' });
    }

    const updatedChat = await toggleArchiveChat(id, archive);
    return res.json(updatedChat);
  } catch (error) {
    console.error('[API] Erro ao alterar estado de arquivamento:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/chats/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { timestamp: 'asc' }
    });

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { unreadCount: 0 }
    });

    io.emit('chat:updated', updatedChat);

    return res.json({ messages, total: messages.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; 
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'O texto da mensagem é obrigatório.' });
    }

    const savedMsg = await sendMessage(id, text);
    return res.json(savedMsg);
  } catch (error) {
    console.error('[API] Erro ao enviar mensagem:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats/:id/load-history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldestMessage = await prisma.message.findFirst({
      where: { chatId: id },
      orderBy: { timestamp: 'asc' }
    });

    const count = 150;
    const socketObj = getWASocket();
    
    if (!socketObj) {
      return res.status(400).json({ error: 'WhatsApp não está conectado.' });
    }

    if (oldestMessage) {
      const key = {
        id: oldestMessage.id,
        remoteJid: id,
        fromMe: oldestMessage.fromMe
      };
      
      console.log(`[API] Solicitando mais ${count} mensagens anteriores no chat ${id}`);
      
      req.io.emit('history:progress', {
        chatId: id,
        status: 'downloading',
        current: 0,
        total: count,
        percent: 20,
        estTimeSeconds: 5
      });

      await socketObj.fetchMessageHistory(count, key, Math.floor(oldestMessage.timestamp.getTime() / 1000));
      return res.json({ success: true, hasMore: true, message: 'Solicitação de histórico anterior enviada.' });
    } else {
      console.log(`[API] Chat ${id} não possui mensagens locais — histórico esgotado.`);
      return res.json({ success: false, hasMore: false, message: 'Sem mais histórico disponível.' });
    }
  } catch (error) {
    console.error('[API] Erro ao solicitar histórico do WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/chats/:id/crm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { funnelStage, tags, notes, name } = req.body;

    const updatedData = {};
    if (funnelStage !== undefined) updatedData.funnelStage = funnelStage;
    if (tags !== undefined) updatedData.tags = tags;
    if (notes !== undefined) updatedData.notes = notes;
    if (name !== undefined) updatedData.name = name;

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: updatedData,
      include: {
        store: true,
        assignedUser: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    io.emit('chat:updated', updatedChat);

    return res.json(updatedChat);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Atribui uma conversa a uma filial e/ou atendente (Fase 05)
 */
app.put('/api/chats/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId, assignedUserId } = req.body;

    const dataToUpdate = {};
    if (storeId !== undefined) {
      dataToUpdate.storeId = storeId || null;
    }
    if (assignedUserId !== undefined) {
      dataToUpdate.assignedUserId = assignedUserId || null;
    }

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: dataToUpdate,
      include: {
        store: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    io.emit('chat:updated', updatedChat);
    return res.json(updatedChat);
  } catch (error) {
    console.error('[API] Erro ao atribuir conversa:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- GESTÃO DE FILIAIS E LOJAS (Fase 05) ---

app.get('/api/stores', authenticateToken, async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            users: true,
            chats: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(stores);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/stores', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'O nome da filial é obrigatório.' });
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null
      }
    });

    io.emit('store:new', store);
    return res.status(201).json(store);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/stores/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    const store = await prisma.store.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        address: address !== undefined ? (address?.trim() || null) : undefined,
        phone: phone !== undefined ? (phone?.trim() || null) : undefined
      }
    });

    io.emit('store:updated', store);
    return res.json(store);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/stores/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Desvincula chats e usuários antes de remover a filial
    await prisma.chat.updateMany({
      where: { storeId: id },
      data: { storeId: null }
    });

    await prisma.user.updateMany({
      where: { storeId: id },
      data: { storeId: null }
    });

    await prisma.store.delete({
      where: { id }
    });

    io.emit('store:deleted', { id });
    return res.json({ success: true, message: 'Filial removida com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// --- GESTÃO DE ATENDENTES E OPERADORES (Fase 05) ---

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        storeId: true,
        store: true,
        createdAt: true,
        _count: {
          select: {
            assignedChats: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, password, name, role, storeId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Já existe um operador com este e-mail.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        role: role || 'OPERATOR',
        storeId: storeId || null,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        storeId: true,
        store: true,
        createdAt: true
      }
    });

    io.emit('user:new', user);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, storeId, isActive, password } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (role !== undefined) dataToUpdate.role = role;
    if (storeId !== undefined) dataToUpdate.storeId = storeId || null;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        storeId: true,
        store: true,
        createdAt: true
      }
    });

    io.emit('user:updated', user);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// --- MÉTRICAS ANALÍTICAS DO DASHBOARD (Fase 07) ---

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { storeId, assignedUserId } = req.query;

    const chatWhere = {};
    if (storeId) chatWhere.storeId = storeId;
    if (assignedUserId) {
      if (assignedUserId === 'unassigned') {
        chatWhere.assignedUserId = null;
      } else {
        chatWhere.assignedUserId = assignedUserId;
      }
    }

    // 1. Total de conversas e distribuição de funil
    const totalChats = await prisma.chat.count({ where: chatWhere });
    const archivedChats = await prisma.chat.count({ where: { ...chatWhere, isArchived: true } });
    const activeChats = totalChats - archivedChats;

    const leadsCount = await prisma.chat.count({ where: { ...chatWhere, funnelStage: 'LEAD', isArchived: false } });
    const negotiationCount = await prisma.chat.count({ where: { ...chatWhere, funnelStage: 'NEGOTIATION', isArchived: false } });
    const proposalCount = await prisma.chat.count({ where: { ...chatWhere, funnelStage: 'PROPOSAL', isArchived: false } });
    const closedCount = await prisma.chat.count({ where: { ...chatWhere, funnelStage: 'CLOSED', isArchived: false } });

    // Taxa de conversão: (fechados / total ativos) * 100
    const conversionRate = activeChats > 0 ? Number(((closedCount / activeChats) * 100).toFixed(1)) : 0;

    // 2. Mensagens trocadas
    let messageWhere = {};
    if (storeId || assignedUserId) {
      const matchingChats = await prisma.chat.findMany({
        where: chatWhere,
        select: { id: true }
      });
      messageWhere.chatId = { in: matchingChats.map(c => c.id) };
    }

    const totalMessages = await prisma.message.count({ where: messageWhere });
    const sentMessages = await prisma.message.count({ where: { ...messageWhere, fromMe: true } });
    const receivedMessages = totalMessages - sentMessages;

    // Mensagens hoje
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMessages = await prisma.message.count({
      where: {
        ...messageWhere,
        timestamp: { gte: startOfToday }
      }
    });

    // 3. Distribuição por Filial (Lojas)
    const stores = await prisma.store.findMany({
      include: {
        chats: {
          select: { id: true, funnelStage: true, isArchived: true }
        },
        users: {
          select: { id: true }
        }
      }
    });

    const storesStats = stores.map(s => {
      const sActiveChats = s.chats.filter(c => !c.isArchived);
      const sClosed = sActiveChats.filter(c => c.funnelStage === 'CLOSED').length;
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        totalChats: sActiveChats.length,
        closedChats: sClosed,
        operatorsCount: s.users.length,
        percentOfTotal: activeChats > 0 ? Number(((sActiveChats.length / activeChats) * 100).toFixed(1)) : 0
      };
    });

    // 4. Desempenho por Atendente (Equipe)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        store: { select: { id: true, name: true } },
        assignedChats: {
          select: { id: true, funnelStage: true, isArchived: true }
        }
      }
    });

    const teamStats = users.map(u => {
      const uActiveChats = u.assignedChats.filter(c => !c.isArchived);
      const uClosed = uActiveChats.filter(c => c.funnelStage === 'CLOSED').length;
      const uConversion = uActiveChats.length > 0 ? Number(((uClosed / uActiveChats.length) * 100).toFixed(1)) : 0;
      return {
        id: u.id,
        name: u.name || u.email,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        storeName: u.store?.name || 'Sem filial',
        totalAssigned: uActiveChats.length,
        closedCount: uClosed,
        conversionRate: uConversion
      };
    });

    // 5. Volume dos últimos 7 dias
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayCount = await prisma.message.count({
        where: {
          ...messageWhere,
          timestamp: { gte: dayStart, lte: dayEnd }
        }
      });

      const dayName = dayStart.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
      last7Days.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayName,
        count: dayCount
      });
    }

    return res.json({
      summary: {
        totalChats,
        activeChats,
        archivedChats,
        conversionRate,
        funnel: {
          lead: leadsCount,
          negotiation: negotiationCount,
          proposal: proposalCount,
          closed: closedCount
        },
        messages: {
          total: totalMessages,
          sent: sentMessages,
          received: receivedMessages,
          today: todayMessages
        }
      },
      stores: storesStats,
      team: teamStats,
      timeline: last7Days
    });
  } catch (error) {
    console.error('[API] Erro ao gerar métricas do dashboard:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- AUTOMAÇÕES REAIS DE ATENDIMENTO (Fase 08) ---

app.get('/api/automations', authenticateToken, async (req, res) => {
  try {
    const automations = await prisma.automation.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return res.json(automations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/automations', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, type, enabled, message, startHour, endHour, workDays } = req.body;
    if (!type || !message) {
      return res.status(400).json({ error: 'Tipo e mensagem da automação são obrigatórios.' });
    }

    const created = await prisma.automation.create({
      data: {
        name: name || type,
        type,
        enabled: enabled ?? false,
        message,
        startHour: startHour ? Number(startHour) : 8,
        endHour: endHour ? Number(endHour) : 18,
        workDays: workDays || '1,2,3,4,5'
      }
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/automations/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, enabled, message, startHour, endHour, workDays } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (enabled !== undefined) dataToUpdate.enabled = enabled;
    if (message !== undefined) dataToUpdate.message = message;
    if (startHour !== undefined) dataToUpdate.startHour = Number(startHour);
    if (endHour !== undefined) dataToUpdate.endHour = Number(endHour);
    if (workDays !== undefined) dataToUpdate.workDays = workDays;

    const updated = await prisma.automation.update({
      where: { id },
      data: dataToUpdate
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/automations/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.automation.delete({
      where: { id }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// --- INTEGRAÇÃO REAL DE IA (LLM COPILOT - FASE 09) ---

app.get('/api/ai/config', authenticateToken, async (req, res) => {
  try {
    let config = await prisma.aiConfig.findFirst();
    if (!config) {
      config = await prisma.aiConfig.create({
        data: {
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          systemPrompt: 'Você é o Copiloto Comercial de Inteligência Artificial da concessionária Shineray Motos. Ajude o atendente a responder os clientes com clareza, simpatia, foco em vendas e informações precisas sobre motos, financiamento, consórcio e test-ride.',
          temperature: 0.7,
          enabled: false
        }
      });
    }

    const hasApiKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
    const maskedKey = hasApiKey 
      ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}`
      : '';

    return res.json({
      id: config.id,
      provider: config.provider,
      model: config.model,
      systemPrompt: config.systemPrompt,
      temperature: config.temperature,
      enabled: config.enabled,
      hasApiKey,
      maskedKey,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/ai/config', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { provider, apiKey, model, systemPrompt, temperature, enabled } = req.body;

    let config = await prisma.aiConfig.findFirst();
    const dataToUpdate = {};
    if (provider !== undefined) dataToUpdate.provider = provider;
    if (model !== undefined) dataToUpdate.model = model;
    if (systemPrompt !== undefined) dataToUpdate.systemPrompt = systemPrompt;
    if (temperature !== undefined) dataToUpdate.temperature = Number(temperature);
    if (enabled !== undefined) dataToUpdate.enabled = Boolean(enabled);

    if (apiKey !== undefined && apiKey.trim().length > 0) {
      dataToUpdate.apiKey = apiKey.trim();
    }

    if (config) {
      config = await prisma.aiConfig.update({
        where: { id: config.id },
        data: dataToUpdate
      });
    } else {
      config = await prisma.aiConfig.create({
        data: {
          provider: provider || 'gemini',
          apiKey: apiKey ? apiKey.trim() : null,
          model: model || 'gemini-1.5-flash',
          systemPrompt: systemPrompt || 'Você é o Copiloto Comercial de Inteligência Artificial da concessionária Shineray Motos.',
          temperature: temperature ? Number(temperature) : 0.7,
          enabled: enabled !== undefined ? Boolean(enabled) : false
        }
      });
    }

    const hasApiKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
    const maskedKey = hasApiKey 
      ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}`
      : '';

    return res.json({
      id: config.id,
      provider: config.provider,
      model: config.model,
      systemPrompt: config.systemPrompt,
      temperature: config.temperature,
      enabled: config.enabled,
      hasApiKey,
      maskedKey,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/test', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;

    let keyToUse = apiKey;
    let providerToUse = provider;
    let modelToUse = model;

    if (!keyToUse) {
      const savedConfig = await prisma.aiConfig.findFirst();
      if (savedConfig && savedConfig.apiKey) {
        keyToUse = savedConfig.apiKey;
        if (!providerToUse) providerToUse = savedConfig.provider;
        if (!modelToUse) modelToUse = savedConfig.model;
      }
    }

    if (!keyToUse) {
      return res.status(400).json({ error: 'Nenhuma chave de API informada ou salva para teste.' });
    }

    const testResponse = await testAiConnection({
      provider: providerToUse || 'gemini',
      apiKey: keyToUse,
      model: modelToUse
    });

    return res.json({ success: true, message: 'Conexão com a IA validada com sucesso!', response: testResponse });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/suggest', authenticateToken, async (req, res) => {
  try {
    const { chatId, mode, draftText } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: 'ID da conversa é obrigatório.' });
    }

    const config = await prisma.aiConfig.findFirst();
    if (!config || !config.enabled) {
      return res.status(400).json({
        error: 'O Copiloto de IA está desativado no momento. Acesse a Central de IA para ativá-lo.'
      });
    }

    if (!config.apiKey || !config.apiKey.trim()) {
      return res.status(400).json({
        error: 'Chave de API da IA não configurada. Cadastre sua chave nas configurações para usar o Copiloto.'
      });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        store: true,
        assignedUser: true
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    const orderedChat = {
      ...chat,
      messages: (chat.messages || []).slice().reverse()
    };

    const suggestionResult = await generateCopilotSuggestion({
      chat: orderedChat,
      mode: mode || 'suggest',
      draftText: draftText || '',
      config
    });

    return res.json(suggestionResult);
  } catch (error) {
    console.error('[AI] Erro ao gerar sugestão:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- HEALTHCHECK & MONITORAMENTO DE PRODUÇÃO (Fase 10) ---

app.get('/api/health', async (req, res) => {
  let dbStatus = 'healthy';
  let dbError = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'unhealthy';
    dbError = err.message;
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const waStatus = getConnectionStatus();

  const isHealthy = dbStatus === 'healthy';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    service: 'PixelCRM-Shineray-Backend',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`
    },
    database: {
      status: dbStatus,
      dialect: 'sqlite',
      error: dbError
    },
    whatsapp: {
      connection: waStatus.status,
      authenticated: waStatus.status === 'connected',
      phone: waStatus.user?.id || null
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024))
      }
    }
  });
});

// --- CONEXÃO WEBSOCKET ---

io.on('connection', (socket) => {
  console.log(`[Socket] Novo cliente conectado: ${socket.id}`);
  socket.emit('whatsapp:status', getConnectionStatus());

  socket.on('disconnect', () => {
    console.log(`[Socket] Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`[Server] Servidor backend rodando na porta ${PORT}`);
  
  // Inicializa o administrador padrão com senha hashada (Fase 01 - Segurança)
  await ensureDefaultAdmin();

  try {
    await initWhatsApp(io);
  } catch (err) {
    console.error('[WhatsApp] Falha crítica ao iniciar Baileys:', err);
  }
});

// --- ENCERRAMENTO SEGURO (GRACEFUL SHUTDOWN - Fase 10) ---

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Shutdown] Sinal ${signal} recebido. Iniciando encerramento gracioso...`);

  server.close(async () => {
    console.log('[Shutdown] Servidor HTTP encerrado.');

    try {
      await prisma.$disconnect();
      console.log('[Shutdown] Conexão com banco de dados Prisma fechada.');
    } catch (err) {
      console.error('[Shutdown] Erro ao desconectar Prisma:', err);
    }

    console.log('[Shutdown] Encerramento concluído com sucesso.');
    process.exit(0);
  });

  setTimeout(() => {
    console.warn('[Shutdown] Forçando encerramento após timeout de 10s.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
