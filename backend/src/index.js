// Servidor principal SiteShineray CRM
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initWhatsApp, getConnectionStatus, logoutWhatsApp, sendMessage, getWASocket, toggleArchiveChat } from './whatsapp.js';
import { prisma } from './db.js';
import { authenticateToken, requireRole, generateToken } from './auth.js';
import { ensureDefaultAdmin } from './initAdmin.js';

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
