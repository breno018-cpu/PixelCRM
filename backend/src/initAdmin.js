import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

export async function ensureDefaultAdmin() {
  try {
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
          isActive: true
        }
      });
      console.log(`[Auth] Administrador padrão inicializado no banco: ${user.email} (Perfil: ${user.role})`);
    }
  } catch (error) {
    console.error('[Auth] Erro ao verificar/inicializar administrador padrão:', error);
  }
}
