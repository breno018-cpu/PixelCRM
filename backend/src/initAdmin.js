import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

export async function ensureDefaultAdmin() {
  try {
    // 1. Garante que exista ao menos uma loja/filial padrão
    let defaultStore = await prisma.store.findFirst({
      where: { name: 'Matriz Shineray' }
    });

    if (!defaultStore) {
      defaultStore = await prisma.store.create({
        data: {
          name: 'Matriz Shineray',
          address: 'Av. Marechal Mascarenhas de Morais, Imbiribeira',
          phone: '(81) 3333-0001'
        }
      });
      console.log(`[Store] Loja matriz padrão criada: ${defaultStore.name} (ID: ${defaultStore.id})`);
    }

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'shinerayl1mh@view.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'hadade123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() }
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: adminEmail.toLowerCase().trim(),
          passwordHash,
          name: 'Operador Principal',
          role: 'ADMIN',
          isActive: true,
          storeId: defaultStore.id
        }
      });
      console.log(`[Auth] Administrador padrão inicializado no banco: ${user.email} (Perfil: ${user.role})`);
    } else if (!existingAdmin.storeId) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { storeId: defaultStore.id }
      });
    }

    // Vincula chats sem loja à loja matriz padrão
    await prisma.chat.updateMany({
      where: { storeId: null },
      data: { storeId: defaultStore.id }
    });

    // Inicializa regras padrão de automação se não existirem
    await ensureDefaultAutomations();

  } catch (error) {
    console.error('[Auth] Erro ao verificar/inicializar administrador e loja padrão:', error);
  }
}

export async function ensureDefaultAutomations() {
  try {
    const welcome = await prisma.automation.findUnique({
      where: { type: 'WELCOME' }
    });
    if (!welcome) {
      await prisma.automation.create({
        data: {
          name: 'Mensagem de Boas-Vindas',
          type: 'WELCOME',
          enabled: false,
          message: 'Olá! Seja bem-vindo à Shineray. Como podemos te ajudar hoje?'
        }
      });
      console.log('[Automation] Regra de boas-vindas inicializada no banco.');
    }

    const outOfHours = await prisma.automation.findUnique({
      where: { type: 'OUT_OF_HOURS' }
    });
    if (!outOfHours) {
      await prisma.automation.create({
        data: {
          name: 'Mensagem Fora do Horário Comercial',
          type: 'OUT_OF_HOURS',
          enabled: false,
          startHour: 8,
          endHour: 18,
          workDays: '1,2,3,4,5',
          message: 'Nosso horário de atendimento é de segunda a sexta, das 08h às 18h. Recebemos sua mensagem e retornaremos assim que iniciarmos o expediente!'
        }
      });
      console.log('[Automation] Regra fora de horário inicializada no banco.');
    }
  } catch (error) {
    console.error('[Automation] Erro ao inicializar regras padrão:', error);
  }
}
