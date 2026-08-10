import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { prisma } from './db.js';

let sock = null;
let ioInstance = null;
let connectionStatus = 'disconnected'; // 'connecting', 'qr', 'connected', 'disconnected'
let latestQrCode = null;
let isSyncingHistory = false; // Flag para evitar execuções simultâneas do sincronizador em lote
const AUTH_DIR = path.resolve('auth_info_baileys');

/**
 * Retorna o socket do Baileys ativo
 */
export function getWASocket() {
  return sock;
}

/**
 * Helper para extrair o texto de mensagens do WhatsApp,
 * mesmo que estejam aninhadas (ex: efêmeras, visualização única, etc).
 */
function getMessageText(message) {
  if (!message) return '';
  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  if (message.videoMessage?.caption) return message.videoMessage.caption;
  
  // Mensagens efêmeras
  if (message.ephemeralMessage?.message) return getMessageText(message.ephemeralMessage.message);
  
  // Mensagens de visualização única
  if (message.viewOnceMessage?.message) return getMessageText(message.viewOnceMessage.message);
  if (message.viewOnceMessageV2?.message) return getMessageText(message.viewOnceMessageV2.message);
  
  // Legendas de documentos
  if (message.documentMessage?.caption) return message.documentMessage.caption;
  
  return '';
}

/**
 * Sincroniza em lote e segundo plano 200 mensagens anteriores de cada um dos chats mais ativos.
 * Isso garante o carregamento em massa de mensagens passadas sem intervenção do usuário.
 */
export async function startBackgroundHistorySync() {
  if (isSyncingHistory || !sock || connectionStatus !== 'connected') return;
  isSyncingHistory = true;
  console.log('[WhatsApp] Iniciando sincronizador de histórico profundo em lote...');

  try {
    // Busca os 40 chats mais recentes ordenados por última mensagem
    const chatsToSync = await prisma.chat.findMany({
      where: { isArchived: false },
      orderBy: { lastMessageTime: 'desc' },
      take: 40
    });

    console.log(`[WhatsApp] Sincronizando lotes de 200 mensagens para os ${chatsToSync.length} contatos mais recentes...`);

    for (const [index, chat] of chatsToSync.entries()) {
      // Interrompe se o dispositivo desconectar durante a varredura
      if (connectionStatus !== 'connected') break;

      // Localiza a mensagem local mais antiga desse chat
      const oldestMessage = await prisma.message.findFirst({
        where: { chatId: chat.id },
        orderBy: { timestamp: 'asc' }
      });

      const count = 200; // Coleta 200 mensagens de uma só vez
      const estTimeLeft = (chatsToSync.length - index) * 4; // Estimativa baseada em 4 segundos por contato restante

      // Notifica o início de sincronização deste chat para o progresso do frontend
      ioInstance?.emit('history:progress', {
        chatId: chat.id,
        chatName: chat.name || chat.phone,
        status: 'downloading',
        current: 0,
        total: count,
        percent: 15,
        estTimeSeconds: estTimeLeft
      });

      try {
        if (oldestMessage) {
          const key = {
            id: oldestMessage.id,
            remoteJid: chat.id,
            fromMe: oldestMessage.fromMe
          };
          console.log(`[WhatsApp] Puxando lote de ${count} mensagens anteriores para o contato: ${chat.name || chat.id}`);
          await sock.fetchMessageHistory(count, key, Math.floor(oldestMessage.timestamp.getTime() / 1000));
        } else {
          console.log(`[WhatsApp] Puxando lote inicial de ${count} mensagens para o contato: ${chat.name || chat.id}`);
          await sock.fetchMessageHistory(count, null, Math.floor(Date.now() / 1000));
        }
      } catch (err) {
        console.error(`[WhatsApp] Falha ao solicitar histórico para o chat ${chat.id}:`, err.message);
        ioInstance?.emit('history:progress', {
          chatId: chat.id,
          status: 'failed',
          current: 0,
          total: count,
          percent: 0,
          estTimeSeconds: 0
        });
      }

      // Intervalo de segurança de 4 segundos entre contatos para evitar bans e flood da rede
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    console.log('[WhatsApp] Sincronizador de histórico profundo em lote concluído.');
  } catch (error) {
    console.error('[WhatsApp] Erro no sincronizador de histórico em segundo plano:', error);
  } finally {
    isSyncingHistory = false;
  }
}

/**
 * Busca e atualiza a imagem de perfil (avatar) de um contato direto no WhatsApp.
 * @param {string} jid - JID do contato
 */
export async function updateContactAvatar(jid) {
  if (!sock || connectionStatus !== 'connected') return null;
  try {
    const avatarUrl = await sock.profilePictureUrl(jid, 'image');
    if (avatarUrl) {
      const updatedChat = await prisma.chat.update({
        where: { id: jid },
        data: { avatarUrl }
      });
      ioInstance?.emit('chat:updated', updatedChat);
      return avatarUrl;
    }
  } catch (e) {
    // Se o contato não tiver foto pública ou der erro, apenas ignoramos
  }
  return null;
}

/**
 * Sincroniza a lista de contatos do celular com o banco de dados.
 */
async function syncContacts(contacts) {
  if (!contacts || !contacts.length) return;
  console.log(`[WhatsApp] Sincronizando ${contacts.length} contatos da agenda...`);
  
  for (const contact of contacts) {
    const jid = contact.id;
    if (!jid || jid === 'status@broadcast') continue;
    const phone = jid.split('@')[0];
    
    const contactName = contact.name || contact.verifiedName || contact.notify;
    if (!contactName) continue;

    try {
      const chat = await prisma.chat.findUnique({ where: { id: jid } });
      if (chat) {
        const updatedChat = await prisma.chat.update({
          where: { id: jid },
          data: {
            name: contactName,
            pushName: contact.notify || chat.pushName
          }
        });
        ioInstance?.emit('chat:updated', updatedChat);
      } else {
        const newChat = await prisma.chat.create({
          data: {
            id: jid,
            name: contactName,
            pushName: contact.notify || null,
            phone: phone
          }
        });
        ioInstance?.emit('chat:new', newChat);
      }

      // Baixa a foto de perfil real em background
      updateContactAvatar(jid).catch(() => {});
    } catch (e) {
      // Ignora falhas
    }
  }
}

/**
 * Inicializa a conexão com o WhatsApp usando Baileys e Socket.io.
 * @param {import('socket.io').Server} io - Instância do Socket.io para comunicação em tempo real
 */
export async function initWhatsApp(io) {
  ioInstance = io;
  console.log('[WhatsApp] Buscando versão mais recente do WhatsApp Web...');
  connectionStatus = 'connecting';
  emitStatusUpdate();

  let version = [2, 3000, 1015941307]; // Fallback para uma versão recente e segura do WA Web
  try {
    const latest = await fetchLatestBaileysVersion();
    if (latest && latest.version) {
      version = latest.version;
      console.log(`[WhatsApp] Usando versão do WA Web buscada: v${version.join('.')}, isLatest: ${latest.isLatest}`);
    }
  } catch (err) {
    console.warn('[WhatsApp] Erro ao buscar versão recente do WA Web, usando fallback:', err.message);
  }

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'warn' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: true, 
    shouldSyncHistoryMessage: () => true, // Garante processamento de mensagens de histórico
    defaultQueryTimeoutMs: 120000,
    connectTimeoutMs: 120000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('[WhatsApp] Novo QR Code gerado.');
      try {
        latestQrCode = await QRCode.toDataURL(qr);
        connectionStatus = 'qr';
        emitStatusUpdate();
      } catch (err) {
        console.error('[WhatsApp] Erro ao converter QR para Base64:', err);
      }
    }

    if (connection === 'open') {
      console.log('[WhatsApp] Conectado com sucesso!');
      connectionStatus = 'connected';
      latestQrCode = null;
      emitStatusUpdate();

      const userJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      console.log(`[WhatsApp] Logado como: ${sock.user.name || 'Dispositivo'} (${userJid})`);

      // Agenda a sincronização detalhada de histórico para conexões recorrentes após 8 segundos
      setTimeout(() => {
        startBackgroundHistorySync().catch(console.error);
      }, 8000);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode;
      const reason = lastDisconnect?.error?.message || 'Conexão encerrada';
      console.log(`[WhatsApp] Conexão fechada. Motivo: ${reason} (Código: ${statusCode})`);

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('[WhatsApp] Reconectando automaticamente...');
        connectionStatus = 'connecting';
        emitStatusUpdate();
        setTimeout(() => initWhatsApp(io), 5000);
      } else {
        console.log('[WhatsApp] Dispositivo deslogado. Limpando credenciais...');
        connectionStatus = 'disconnected';
        latestQrCode = null;
        emitStatusUpdate();

        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          console.log('[WhatsApp] Pasta auth_info_baileys removida.');
        } catch (err) {
          console.error('[WhatsApp] Erro ao remover pasta de autenticação:', err);
        }

        setTimeout(() => initWhatsApp(io), 2000);
      }
    }
  });

  sock.ev.on('contacts.upsert', async (contacts) => {
    await syncContacts(contacts);
  });

  sock.ev.on('contacts.update', async (contacts) => {
    await syncContacts(contacts);
  });

  sock.ev.on('messages.upsert', async (m) => {
    const { messages, type } = m;
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        const savedMsg = await saveMessage(msg, true);
        if (savedMsg) {
          ioInstance.emit('message:new', savedMsg);
        }
      } catch (error) {
        console.error('[WhatsApp] Erro ao processar mensagem upsert:', error);
      }
    }
  });

  sock.ev.on('messaging-history.set', async ({ chats: historicalChats, contacts, messages: historicalMessages }) => {
    console.log(`[WhatsApp] Histórico recebido: ${historicalChats?.length || 0} chats, ${contacts?.length || 0} contatos, ${historicalMessages?.length || 0} mensagens.`);
    
    try {
      await syncContacts(contacts);

      // 1. Sincroniza e cria/atualiza os chats do histórico
      console.log('[WhatsApp] Gravando informações de chats...');
      for (const chat of historicalChats || []) {
        const jid = chat.id;
        if (!jid || jid === 'status@broadcast') continue;
        const phone = jid.split('@')[0];
        const isArchived = chat.archive === true || chat.archived === true || false;

        await prisma.chat.upsert({
          where: { id: jid },
          create: {
            id: jid,
            name: phone,
            phone: phone,
            unreadCount: chat.unreadCount || 0,
            isArchived: isArchived
          },
          update: {
            unreadCount: chat.unreadCount || 0,
            isArchived: isArchived
          }
        });
      }

      // 2. Prepara e insere mensagens do histórico em lotes para otimizar desempenho e evitar travas no SQLite
      console.log('[WhatsApp] Mapeando mensagens históricas...');
      const messagesToInsert = [];
      for (const msg of historicalMessages || []) {
        const jid = msg.key.remoteJid;
        if (!jid || jid === 'status@broadcast') continue;

        const text = getMessageText(msg.message);
        if (!text && !msg.message?.imageMessage && !msg.message?.audioMessage && !msg.message?.videoMessage && !msg.message?.documentMessage) {
          continue;
        }

        const fromMe = msg.key.fromMe;
        const senderName = msg.pushName || (fromMe ? 'Você' : null);
        const timestamp = new Date((msg.messageTimestamp?.low || msg.messageTimestamp) * 1000);

        let msgType = 'text';
        if (msg.message?.imageMessage) msgType = 'image';
        else if (msg.message?.audioMessage) msgType = 'audio';
        else if (msg.message?.videoMessage) msgType = 'video';
        else if (msg.message?.documentMessage) msgType = 'document';

        messagesToInsert.push({
          id: msg.key.id,
          chatId: jid,
          fromMe: fromMe,
          senderName: senderName,
          text: text,
          type: msgType,
          timestamp: timestamp,
          status: fromMe ? 'SENT' : 'READ'
        });
      }

      console.log(`[WhatsApp] Inserindo ${messagesToInsert.length} mensagens históricas no banco local...`);
      
      const countByChat = {};
      for (const m of messagesToInsert) {
        countByChat[m.chatId] = (countByChat[m.chatId] || 0) + 1;
      }

      const batchSize = 150;
      for (let i = 0; i < messagesToInsert.length; i += batchSize) {
        const batch = messagesToInsert.slice(i, i + batchSize);

        // Garante que todos os chats das mensagens existem no SQLite antes de inserir
        const jidsInBatch = [...new Set(batch.map(m => m.chatId))];
        for (const jid of jidsInBatch) {
          const chatExists = await prisma.chat.findUnique({ where: { id: jid } });
          if (!chatExists) {
            const phone = jid.split('@')[0];
            await prisma.chat.create({
              data: {
                id: jid,
                name: phone,
                phone: phone,
                unreadCount: 0
              }
            });
          }
        }

        // Filtra em memória mensagens que já existem no banco local para evitar conflitos de chave primária no SQLite
        const batchMsgIds = batch.map(m => m.id);
        const existingMessages = await prisma.message.findMany({
          where: { id: { in: batchMsgIds } },
          select: { id: true }
        });
        const existingIdsSet = new Set(existingMessages.map(m => m.id));
        
        const newMessagesToInsert = batch.filter(m => !existingIdsSet.has(m.id));

        if (newMessagesToInsert.length > 0) {
          await prisma.message.createMany({
            data: newMessagesToInsert
          });
        }
      }

      // Emite finalização para cada chat atualizado
      for (const [jid, totalMsgs] of Object.entries(countByChat)) {
        ioInstance?.emit('history:progress', {
          chatId: jid,
          status: 'completed',
          current: totalMsgs,
          total: totalMsgs,
          percent: 100,
          estTimeSeconds: 0
        });
      }

      console.log('[WhatsApp] Sincronização de histórico inicial concluída com sucesso!');
      ioInstance.emit('history:synced');

      // Inicia a sincronização detalhada profunda dos contatos logo após a carga inicial
      setTimeout(() => {
        startBackgroundHistorySync().catch(console.error);
      }, 3000);
      
    } catch (e) {
      console.error('[WhatsApp] Erro ao sincronizar histórico:', e);
    }
  });

  sock.ev.on('chats.upsert', async (newChats) => {
    for (const chat of newChats) {
      const jid = chat.id;
      if (!jid || jid === 'status@broadcast') continue;
      const phone = jid.split('@')[0];
      const isArchived = chat.archive === true || chat.archived === true || false;

      try {
        const dbChat = await prisma.chat.upsert({
          where: { id: jid },
          create: {
            id: jid,
            name: phone,
            phone: phone,
            unreadCount: chat.unreadCount || 0,
            isArchived: isArchived
          },
          update: {
            unreadCount: chat.unreadCount || 0,
            isArchived: isArchived
          }
        });
        ioInstance.emit('chat:new', dbChat);
      } catch (e) {
        console.error('[WhatsApp] Erro em chats.upsert:', e);
      }
    }
  });

  sock.ev.on('chats.update', async (updates) => {
    for (const update of updates) {
      const jid = update.id;
      if (!jid || jid === 'status@broadcast') continue;

      try {
        const chat = await prisma.chat.findUnique({ where: { id: jid } });
        if (!chat) continue;

        const dataToUpdate = {};
        if (update.unreadCount !== undefined) {
          dataToUpdate.unreadCount = update.unreadCount;
        }
        if (update.archive !== undefined) {
          dataToUpdate.isArchived = update.archive;
        }

        if (Object.keys(dataToUpdate).length > 0) {
          const updatedChat = await prisma.chat.update({
            where: { id: jid },
            data: dataToUpdate
          });
          ioInstance.emit('chat:updated', updatedChat);
        }
      } catch (e) {
        console.error('[WhatsApp] Erro em chats.update:', e);
      }
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      const { key, update: msgUpdate } = update;
      if (msgUpdate.status) {
        let statusStr = 'PENDING';
        if (msgUpdate.status === 2) statusStr = 'SENT';
        else if (msgUpdate.status === 3) statusStr = 'DELIVERED';
        else if (msgUpdate.status === 4) statusStr = 'READ';

        try {
          await prisma.message.update({
            where: { id: key.id },
            data: { status: statusStr }
          });
          ioInstance.emit('message:status_updated', {
            id: key.id,
            chatId: key.remoteJid,
            status: statusStr
          });
        } catch (e) {
          // Ignora caso
        }
      }
    }
  });
}

/**
 * Função utilitária para converter e salvar a mensagem no banco de dados.
 */
async function saveMessage(msg, shouldEmit = true) {
  const jid = msg.key.remoteJid;
  if (!jid || jid === 'status@broadcast') return null;

  const text = getMessageText(msg.message);
  
  if (!text && !msg.message?.imageMessage && !msg.message?.audioMessage && !msg.message?.videoMessage && !msg.message?.documentMessage) {
    return null;
  }

  const fromMe = msg.key.fromMe;
  const senderName = msg.pushName || (fromMe ? 'Você' : null);
  const timestamp = new Date((msg.messageTimestamp?.low || msg.messageTimestamp) * 1000);
  const phone = jid.split('@')[0];

  let msgType = 'text';
  if (msg.message?.imageMessage) msgType = 'image';
  else if (msg.message?.audioMessage) msgType = 'audio';
  else if (msg.message?.videoMessage) msgType = 'video';
  else if (msg.message?.documentMessage) msgType = 'document';

  let chat = await prisma.chat.findUnique({
    where: { id: jid }
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        id: jid,
        name: msg.pushName || phone,
        pushName: msg.pushName || null,
        phone: phone,
        unreadCount: fromMe ? 0 : 1,
        lastMessageText: text,
        lastMessageTime: timestamp,
        isArchived: false
      }
    });
    
    updateContactAvatar(jid).catch(() => {});

    if (shouldEmit) {
      ioInstance?.emit('chat:new', chat);
    }
  } else {
    const isNewer = !chat.lastMessageTime || timestamp > new Date(chat.lastMessageTime);
    
    const dataToUpdate = {
      pushName: msg.pushName || chat.pushName
    };

    if (isNewer) {
      dataToUpdate.lastMessageText = text;
      dataToUpdate.lastMessageTime = timestamp;
      if (!fromMe) {
        dataToUpdate.unreadCount = chat.unreadCount + 1;
      }
    }

    chat = await prisma.chat.update({
      where: { id: jid },
      data: dataToUpdate
    });
    
    if (!chat.avatarUrl) {
      updateContactAvatar(jid).catch(() => {});
    }

    if (shouldEmit) {
      ioInstance?.emit('chat:updated', chat);
    }
  }

  let mediaUrl = null;
  if (msgType === 'image') {
    try {
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
        { rekey: true }
      );
      if (buffer) {
        const mediaDir = path.resolve('public/media');
        if (!fs.existsSync(mediaDir)) {
          fs.mkdirSync(mediaDir, { recursive: true });
        }
        const filename = `${msg.key.id}.jpg`;
        fs.writeFileSync(path.join(mediaDir, filename), buffer);
        mediaUrl = `/media/${filename}`;
        console.log(`[WhatsApp] Mídia de imagem baixada e salva em: ${mediaUrl}`);
      }
    } catch (e) {
      console.warn(`[WhatsApp] Ignorando download da imagem ${msg.key.id} (não disponível ou expirada):`, e.message);
    }
  }

  const savedMsg = await prisma.message.upsert({
    where: { id: msg.key.id },
    create: {
      id: msg.key.id,
      chatId: jid,
      fromMe: fromMe,
      senderName: senderName,
      text: text,
      type: msgType,
      mediaUrl: mediaUrl,
      timestamp: timestamp,
      status: fromMe ? 'SENT' : 'READ'
    },
    update: {
      status: fromMe ? 'SENT' : 'READ',
      mediaUrl: mediaUrl !== null ? mediaUrl : undefined
    }
  });

  return savedMsg;
}

/**
 * Envia uma mensagem de texto para um contato.
 */
export async function sendMessage(jid, text) {
  if (!sock || connectionStatus !== 'connected') {
    throw new Error('WhatsApp não está conectado.');
  }

  const sentMsg = await sock.sendMessage(jid, { text: text });
  const timestamp = new Date();
  
  const savedMsg = await prisma.message.create({
    data: {
      id: sentMsg.key.id,
      chatId: jid,
      fromMe: true,
      senderName: 'Você',
      text: text,
      type: 'text',
      timestamp: timestamp,
      status: 'SENT'
    }
  });

  const updatedChat = await prisma.chat.update({
    where: { id: jid },
    data: {
      lastMessageText: text,
      lastMessageTime: timestamp
    }
  });

  ioInstance?.emit('message:new', savedMsg);
  ioInstance?.emit('chat:updated', updatedChat);

  return savedMsg;
}

/**
 * Modifica o estado de arquivamento de um chat (tanto no WhatsApp quanto no SQLite).
 */
export async function toggleArchiveChat(jid, archive) {
  if (!sock || connectionStatus !== 'connected') {
    throw new Error('WhatsApp não está conectado.');
  }

  try {
    // Modifica o chat no WhatsApp real
    await sock.chatModify({ archive: archive }, jid);
  } catch (err) {
    console.error(`[WhatsApp] Falha ao arquivar chat ${jid} no aparelho:`, err.message);
  }

  // Modifica na base SQLite local
  const updatedChat = await prisma.chat.update({
    where: { id: jid },
    data: { isArchived: archive }
  });

  ioInstance?.emit('chat:updated', updatedChat);
  return updatedChat;
}

/**
 * Emite a atualização do estado da conexão para todos os clientes websocket conectados.
 */
function emitStatusUpdate() {
  if (!ioInstance) return;
  ioInstance.emit('whatsapp:status', {
    status: connectionStatus,
    qrCode: latestQrCode
  });
}

/**
 * Retorna o estado atual da conexão.
 */
export function getConnectionStatus() {
  return {
    status: connectionStatus,
    qrCode: latestQrCode
  };
}

/**
 * Desconecta e limpa a sessão atual do WhatsApp.
 */
export async function logoutWhatsApp() {
  if (sock) {
    try {
      await sock.logout();
    } catch (e) {
      console.error('[WhatsApp] Erro ao deslogar via socket:', e);
    }
  }
  
  connectionStatus = 'disconnected';
  latestQrCode = null;
  emitStatusUpdate();

  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.log('[WhatsApp] Sessão encerrada e pasta auth_info_baileys removida.');
  } catch (err) {
    console.error('[WhatsApp] Erro ao remover pasta:', err);
  }
}
