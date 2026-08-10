// Servidor principal SiteShineray CRM
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initWhatsApp, getConnectionStatus, logoutWhatsApp, sendMessage, getWASocket, toggleArchiveChat } from './whatsapp.js';
import { prisma } from './db.js';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors({
  origin: '*', 
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

// --- ROTAS DA API ---

app.get('/api/status', (req, res) => {
  try {
    const status = getConnectionStatus();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    await logoutWhatsApp();
    return res.json({ success: true, message: 'Desconectado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Desconecta o WhatsApp E apaga TODOS os chats e mensagens do banco
app.post('/api/disconnect', async (req, res) => {
  try {
    // 1. Desconecta o WhatsApp (Baileys)
    await logoutWhatsApp();

    // 2. Apaga todas as mensagens e chats do banco de dados
    await prisma.message.deleteMany({});
    await prisma.chat.deleteMany({});

    // 3. Notifica todos os clientes frontend via socket para limpar a tela
    io.emit('whatsapp:disconnected');
    io.emit('chats:cleared');

    return res.json({ success: true, message: 'Dispositivo desconectado e dados apagados.' });
  } catch (error) {
    console.error('[API] Erro ao desconectar e limpar dados:', error);
    return res.status(500).json({ error: error.message });
  }
});


app.get('/api/chats', async (req, res) => {
  try {
    const { search, funnelStage, tag, archived } = req.query;
    const whereClause = {};

    // Filtra conversas arquivadas. Por padrão, se não for especificado, retorna apenas as NÃO arquivadas
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

    const chats = await prisma.chat.findMany({
      where: whereClause,
      orderBy: {
        lastMessageTime: 'desc'
      }
    });

    return res.json(chats);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/chats/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const { archive } = req.body; // true ou false
    
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

app.get('/api/chats/:id/messages', async (req, res) => {
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

    // Retorna mensagens + total para o frontend saber se pode haver mais
    return res.json({ messages, total: messages.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats/:id/messages', async (req, res) => {
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

/**
 * Solicita mensagens antigas adicionais para um chat específico (paginação de histórico).
 */
app.post('/api/chats/:id/load-history', async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldestMessage = await prisma.message.findFirst({
      where: { chatId: id },
      orderBy: { timestamp: 'asc' }
    });

    const count = 150;
    const socketObj = getWASocket();
    
    if (!socketObj) {
      return res.status(400).json({ error: 'WhatsApp n\u00e3o est\u00e1 conectado.' });
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
      return res.json({ success: true, hasMore: true, message: 'Solicita\u00e7\u00e3o de hist\u00f3rico anterior enviada.' });
    } else {
      // Sem mensagem de refer\u00eancia = n\u00e3o h\u00e1 mais hist\u00f3rico para carregar
      console.log(`[API] Chat ${id} n\u00e3o possui mensagens locais — hist\u00f3rico esgotado.`);
      return res.json({ success: false, hasMore: false, message: 'Sem mais hist\u00f3rico dispon\u00edvel.' });
    }
  } catch (error) {
    console.error('[API] Erro ao solicitar hist\u00f3rico do WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/chats/:id/crm', async (req, res) => {
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
      data: updatedData
    });

    io.emit('chat:updated', updatedChat);

    return res.json(updatedChat);
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
  try {
    await initWhatsApp(io);
  } catch (err) {
    console.error('[WhatsApp] Falha crítica ao iniciar Baileys:', err);
  }
});
