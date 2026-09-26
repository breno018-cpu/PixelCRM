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

  } catch (error) {
    console.error('[Auth] Erro ao verificar/inicializar administrador e loja padrão:', error);
  }
}
