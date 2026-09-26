import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from './db.js';
import { authenticateToken } from './auth.js';
import { requirePermission, logAudit, assertNotLastAdmin } from './rbac.js';

export const corporateRouter = express.Router();

// Aplica autenticação JWT obrigatória em todas as rotas corporativas
corporateRouter.use(authenticateToken);

// ==========================================
// 1. EMPRESA
// ==========================================

corporateRouter.get('/companies/current', async (req, res) => {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      return res.status(404).json({ error: 'Nenhuma empresa cadastrada.' });
    }
    res.json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno ao buscar empresa.' });
  }
});

corporateRouter.put('/companies/current', requirePermission('COMPANIES', 'EDIT'), async (req, res) => {
  try {
    const { name, legalName, tradeName, cnpj, phone, email, address, city, state, country, logoUrl, timezone, currency, language } = req.body;
    
    let company = await prisma.company.findFirst();
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: name || company.name,
        legalName,
        tradeName,
        cnpj,
        phone,
        email,
        address,
        city,
        state,
        country,
        logoUrl,
        timezone,
        currency,
        language
      }
    });

    await logAudit({
      companyId: company.id,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'COMPANIES',
      recordId: company.id,
      details: { updatedFields: Object.keys(req.body) },
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar dados da empresa.' });
  }
});

// ==========================================
// 2. LOJAS / FILIAIS
// ==========================================

corporateRouter.get('/stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true, chats: true, teams: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(stores);
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar filiais.' });
  }
});

corporateRouter.post('/stores', requirePermission('STORES', 'CREATE'), async (req, res) => {
  try {
    const { name, code, address, phone, businessHours, managerId, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'O nome da filial é obrigatório.' });
    }

    const company = await prisma.company.findFirst();

    const store = await prisma.store.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        code: code?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        businessHours: businessHours?.trim() || null,
        managerId: managerId || null,
        status: status || 'ACTIVE'
      },
      include: { manager: true }
    });

    await logAudit({
      companyId: company?.id,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'STORES',
      recordId: store.id,
      details: { name: store.name, code: store.code },
      req
    });

    res.status(201).json(store);
  } catch (error) {
    console.error('Erro ao criar filial:', error);
    res.status(500).json({ error: 'Erro interno ao criar filial.' });
  }
});

corporateRouter.put('/stores/:id', requirePermission('STORES', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, businessHours, managerId, status } = req.body;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Filial não encontrada.' });
    }

    const updated = await prisma.store.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        code: code !== undefined ? code?.trim() || null : existing.code,
        address: address !== undefined ? address?.trim() || null : existing.address,
        phone: phone !== undefined ? phone?.trim() || null : existing.phone,
        businessHours: businessHours !== undefined ? businessHours?.trim() || null : existing.businessHours,
        managerId: managerId !== undefined ? managerId || null : existing.managerId,
        status: status || existing.status
      },
      include: { manager: true }
    });

    await logAudit({
      companyId: updated.companyId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'STORES',
      recordId: updated.id,
      details: { changes: req.body },
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar filial.' });
  }
});

corporateRouter.delete('/stores/:id', requirePermission('STORES', 'DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    const store = await prisma.store.findUnique({
      where: { id },
      include: { _count: { select: { users: true, chats: true } } }
    });

    if (!store) {
      return res.status(404).json({ error: 'Filial não encontrada.' });
    }

    if (store._count.users > 0 || store._count.chats > 0) {
      return res.status(400).json({
        error: `Não é possível excluir esta filial pois ela possui ${store._count.users} usuários e ${store._count.chats} conversas vinculadas. Desative-a ou transfira os vínculos primeiro.`
      });
    }

    await prisma.store.delete({ where: { id } });

    await logAudit({
      companyId: store.companyId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'STORES',
      recordId: id,
      details: { name: store.name },
      req
    });

    res.json({ message: 'Filial excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir filial:', error);
    res.status(500).json({ error: 'Erro interno ao excluir filial.' });
  }
});

// ==========================================
// 3. EQUIPES
// ==========================================

corporateRouter.get('/teams', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        store: { select: { id: true, name: true } },
        leader: { select: { id: true, name: true, email: true } },
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(teams);
  } catch (error) {
    console.error('Erro ao listar equipes:', error);
    res.status(500).json({ error: 'Erro interno ao buscar equipes.' });
  }
});

corporateRouter.post('/teams', requirePermission('TEAMS', 'CREATE'), async (req, res) => {
  try {
    const { name, description, storeId, leaderId, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'O nome da equipe é obrigatório.' });
    }

    const company = await prisma.company.findFirst();

    const team = await prisma.team.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        description: description?.trim() || null,
        storeId: storeId || null,
        leaderId: leaderId || null,
        status: status || 'ACTIVE'
      },
      include: { store: true, leader: true }
    });

    await logAudit({
      companyId: company?.id,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'TEAMS',
      recordId: team.id,
      details: { name: team.name },
      req
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Erro ao criar equipe:', error);
    res.status(500).json({ error: 'Erro interno ao criar equipe.' });
  }
});

corporateRouter.put('/teams/:id', requirePermission('TEAMS', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, storeId, leaderId, status, userIds } = req.body;

    const existing = await prisma.team.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipe não encontrada.' });
    }

    const updated = await prisma.team.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        description: description !== undefined ? description?.trim() || null : existing.description,
        storeId: storeId !== undefined ? storeId || null : existing.storeId,
        leaderId: leaderId !== undefined ? leaderId || null : existing.leaderId,
        status: status || existing.status
      },
      include: { store: true, leader: true }
    });

    // Atualização de membros da equipe se fornecido
    if (Array.isArray(userIds)) {
      // Remove quem não está na lista
      await prisma.user.updateMany({
        where: { teamId: id, id: { notIn: userIds } },
        data: { teamId: null }
      });
      // Adiciona quem está na lista
      if (userIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { teamId: id }
        });
      }
    }

    await logAudit({
      companyId: updated.companyId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'TEAMS',
      recordId: updated.id,
      details: { changes: req.body },
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar equipe.' });
  }
});

corporateRouter.delete('/teams/:id', requirePermission('TEAMS', 'DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return res.status(404).json({ error: 'Equipe não encontrada.' });

    // Desvincula usuários da equipe antes de excluir
    await prisma.user.updateMany({
      where: { teamId: id },
      data: { teamId: null }
    });

    await prisma.team.delete({ where: { id } });

    await logAudit({
      companyId: team.companyId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'TEAMS',
      recordId: id,
      details: { name: team.name },
      req
    });

    res.json({ message: 'Equipe removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir equipe:', error);
    res.status(500).json({ error: 'Erro interno ao excluir equipe.' });
  }
});

// ==========================================
// 4. CARGOS E PERMISSÕES
// ==========================================

corporateRouter.get('/permissions', async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }]
    });
    res.json(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ error: 'Erro interno ao buscar permissões.' });
  }
});

corporateRouter.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(roles);
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar cargos.' });
  }
});

corporateRouter.post('/roles', requirePermission('ROLES', 'CREATE'), async (req, res) => {
  try {
    const { name, description, scope, teamId, permissions } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'O nome do cargo é obrigatório.' });
    }

    const company = await prisma.company.findFirst();

    const role = await prisma.role.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        description: description?.trim() || null,
        scope: scope || 'OWN',
        teamId: teamId || null,
        isSystem: false,
        status: 'ACTIVE'
      }
    });

    // Se fornecidas permissões no formato [{ permissionId, scope, granted }]
    if (Array.isArray(permissions)) {
      for (const p of permissions) {
        if (p.granted !== false) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: p.permissionId || p.id,
              scope: p.scope || role.scope,
              granted: true
            }
          });
        }
      }
    }

    await logAudit({
      companyId: company?.id,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'ROLES',
      recordId: role.id,
      details: { name: role.name, scope: role.scope },
      req
    });

    const fullRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }
    });

    res.status(201).json(fullRole);
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    res.status(500).json({ error: 'Erro interno ao criar cargo.' });
  }
});

// Duplicar Cargo com todas as suas permissões
corporateRouter.post('/roles/:id/duplicate', requirePermission('ROLES', 'CREATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    const sourceRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true }
    });

    if (!sourceRole) {
      return res.status(404).json({ error: 'Cargo de origem não encontrado.' });
    }

    const targetName = (newName || `${sourceRole.name} (Cópia)`).trim();

    const newRole = await prisma.role.create({
      data: {
        companyId: sourceRole.companyId,
        name: targetName,
        description: `Duplicado a partir de ${sourceRole.name}. ${sourceRole.description || ''}`.trim(),
        scope: sourceRole.scope,
        teamId: sourceRole.teamId,
        isSystem: false,
        status: 'ACTIVE'
      }
    });

    // Copia todas as permissões concedidas
    for (const rp of sourceRole.permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: newRole.id,
          permissionId: rp.permissionId,
          scope: rp.scope,
          granted: rp.granted
        }
      });
    }

    await logAudit({
      companyId: newRole.companyId,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'ROLES',
      recordId: newRole.id,
      details: { duplicatedFrom: sourceRole.id, sourceName: sourceRole.name, newName: newRole.name },
      req
    });

    const fullRole = await prisma.role.findUnique({
      where: { id: newRole.id },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }
    });

    res.status(201).json(fullRole);
  } catch (error) {
    console.error('Erro ao duplicar cargo:', error);
    res.status(500).json({ error: 'Erro interno ao duplicar cargo.' });
  }
});

corporateRouter.put('/roles/:id', requirePermission('ROLES', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, scope, teamId, status, permissions } = req.body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Cargo não encontrado.' });

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : role.name,
        description: description !== undefined ? description?.trim() || null : role.description,
        scope: scope || role.scope,
        teamId: teamId !== undefined ? teamId || null : role.teamId,
        status: status || role.status
      }
    });

    // Atualiza a matriz de permissões se fornecida
    if (Array.isArray(permissions)) {
      // Remove as permissões antigas do cargo
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });

      for (const p of permissions) {
        if (p.granted !== false) {
          await prisma.rolePermission.create({
            data: {
              roleId: id,
              permissionId: p.permissionId || p.id,
              scope: p.scope || updated.scope,
              granted: true
            }
          });
        }
      }
    }

    await logAudit({
      companyId: updated.companyId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'ROLES',
      recordId: id,
      details: { name: updated.name, permissionsUpdated: Array.isArray(permissions) },
      req
    });

    const fullRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }
    });

    res.json(fullRole);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar cargo.' });
  }
});

corporateRouter.delete('/roles/:id', requirePermission('ROLES', 'DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    });

    if (!role) return res.status(404).json({ error: 'Cargo não encontrado.' });

    if (role.isSystem) {
      return res.status(403).json({ error: 'Cargos essenciais do sistema não podem ser excluídos.' });
    }

    if (role._count.users > 0) {
      return res.status(400).json({
        error: `Existem ${role._count.users} usuários atribuídos a este cargo. Reatribua-os antes de excluir.`
      });
    }

    await prisma.role.delete({ where: { id } });

    await logAudit({
      companyId: role.companyId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'ROLES',
      recordId: id,
      details: { name: role.name },
      req
    });

    res.json({ message: 'Cargo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cargo:', error);
    res.status(500).json({ error: 'Erro interno ao excluir cargo.' });
  }
});

// ==========================================
// 5. GESTÃO DE USUÁRIOS
// ==========================================

corporateRouter.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        storeId: true,
        teamId: true,
        roleId: true,
        createdAt: true,
        store: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        roleRel: { select: { id: true, name: true, scope: true } },
        permissionExceptions: { include: { permission: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
  }
});

corporateRouter.post('/users', requirePermission('USERS', 'CREATE'), async (req, res) => {
  try {
    const { name, email, password, phone, role, roleId, storeId, teamId, isActive } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const emailNorm = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return res.status(409).json({ error: 'Já existe um usuário cadastrado com este e-mail.' });
    }

    const company = await prisma.company.findFirst();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        email: emailNorm,
        passwordHash,
        phone: phone?.trim() || null,
        role: role || 'OPERATOR',
        roleId: roleId || null,
        storeId: storeId || null,
        teamId: teamId || null,
        isActive: isActive !== undefined ? isActive : true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        storeId: true,
        teamId: true,
        roleId: true,
        createdAt: true
      }
    });

    await logAudit({
      companyId: company?.id,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'USERS',
      recordId: user.id,
      details: { email: user.email, name: user.name, role: user.role },
      req
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
});

corporateRouter.put('/users/:id', requirePermission('USERS', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, role, roleId, storeId, teamId, isActive, permissionExceptions } = req.body;

    const user = await prisma.user.findUnique({ where: { id }, include: { roleRel: true } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Proteção rigorosa do último administrador ativo
    if (isActive === false || (role && role !== 'ADMIN')) {
      await assertNotLastAdmin(id, role, isActive);
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role) updateData.role = role;
    if (roleId !== undefined) updateData.roleId = roleId || null;
    if (storeId !== undefined) updateData.storeId = storeId || null;
    if (teamId !== undefined) updateData.teamId = teamId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        storeId: true,
        teamId: true,
        roleId: true
      }
    });

    // Se fornecidas exceções de permissão para este usuário específico
    if (Array.isArray(permissionExceptions)) {
      await prisma.userPermissionException.deleteMany({ where: { userId: id } });
      for (const exc of permissionExceptions) {
        await prisma.userPermissionException.create({
          data: {
            userId: id,
            permissionId: exc.permissionId,
            granted: exc.granted,
            scopeOverride: exc.scopeOverride || null,
            validUntil: exc.validUntil ? new Date(exc.validUntil) : null
          }
        });
      }
    }

    await logAudit({
      companyId: user.companyId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'USERS',
      recordId: id,
      details: { changes: Object.keys(updateData) },
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(error.message?.includes('bloqueada') ? 403 : 500).json({ error: error.message || 'Erro interno ao atualizar usuário.' });
  }
});

corporateRouter.delete('/users/:id', requirePermission('USERS', 'DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    await assertNotLastAdmin(id, null, false);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Desvincula chats do usuário antes de deletar
    await prisma.chat.updateMany({
      where: { assignedUserId: id },
      data: { assignedUserId: null }
    });

    await prisma.user.delete({ where: { id } });

    await logAudit({
      companyId: user.companyId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'USERS',
      recordId: id,
      details: { email: user.email, name: user.name },
      req
    });

    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(error.message?.includes('bloqueada') ? 403 : 500).json({ error: error.message || 'Erro interno ao excluir usuário.' });
  }
});

// ==========================================
// 6. CATÁLOGO DE PRODUTOS E CATEGORIAS
// ==========================================

corporateRouter.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno ao listar categorias.' });
  }
});

corporateRouter.post('/categories', requirePermission('PRODUCTS', 'CREATE'), async (req, res) => {
  try {
    const { name, description, orderIndex } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

    const company = await prisma.company.findFirst();
    const category = await prisma.productCategory.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        description: description?.trim() || null,
        orderIndex: Number(orderIndex) || 0
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno ao criar categoria.' });
  }
});

corporateRouter.get('/collections', async (req, res) => {
  try {
    const collections = await prisma.productCollection.findMany({
      include: {
        items: {
          include: { product: true },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(collections);
  } catch (error) {
    console.error('Erro ao listar coleções:', error);
    res.status(500).json({ error: 'Erro interno ao listar coleções.' });
  }
});

corporateRouter.post('/collections', requirePermission('PRODUCTS', 'CREATE'), async (req, res) => {
  try {
    const { name, description, slug, orderIndex, productIds } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome da coleção é obrigatório.' });

    const company = await prisma.company.findFirst();
    const collection = await prisma.productCollection.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        description: description?.trim() || null,
        slug: slug?.trim() || null,
        orderIndex: Number(orderIndex) || 0
      }
    });

    if (Array.isArray(productIds)) {
      for (let i = 0; i < productIds.length; i++) {
        await prisma.collectionProduct.create({
          data: {
            collectionId: collection.id,
            productId: productIds[i],
            orderIndex: i
          }
        });
      }
    }

    res.status(201).json(collection);
  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    res.status(500).json({ error: 'Erro interno ao criar coleção.' });
  }
});

corporateRouter.get('/products', async (req, res) => {
  try {
    const { categoryId, search, visibility, storeId } = req.query;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (visibility) where.visibility = visibility;
    if (storeId) where.storeId = storeId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        store: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
  }
});

corporateRouter.post('/products', requirePermission('PRODUCTS', 'CREATE'), async (req, res) => {
  try {
    const { name, sku, description, brand, categoryId, storeId, price, promoPrice, cost, margin, stockStatus, originCountry, images, videoUrl, link, visibility } = req.body;

    if (!name?.trim() || price === undefined) {
      return res.status(400).json({ error: 'Nome do produto e preço regular são obrigatórios.' });
    }

    const company = await prisma.company.findFirst();

    const product = await prisma.product.create({
      data: {
        companyId: company?.id,
        name: name.trim(),
        sku: sku?.trim() || null,
        description: description?.trim() || null,
        brand: brand?.trim() || 'Shineray',
        categoryId: categoryId || null,
        storeId: storeId || null,
        price: Number(price),
        promoPrice: promoPrice !== undefined && promoPrice !== null ? Number(promoPrice) : null,
        cost: cost !== undefined && cost !== null ? Number(cost) : null,
        margin: margin !== undefined && margin !== null ? Number(margin) : null,
        stockStatus: stockStatus || 'AVAILABLE',
        originCountry: originCountry?.trim() || 'Brasil',
        images: Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
        videoUrl: videoUrl?.trim() || null,
        link: link?.trim() || null,
        visibility: visibility || 'VISIBLE'
      },
      include: { category: true }
    });

    await logAudit({
      companyId: company?.id,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'PRODUCTS',
      recordId: product.id,
      details: { name: product.name, sku: product.sku, price: product.price },
      req
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
  }
});

corporateRouter.put('/products/:id', requirePermission('PRODUCTS', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Produto não encontrado.' });

    const { name, sku, description, brand, categoryId, storeId, price, promoPrice, cost, margin, stockStatus, originCountry, images, videoUrl, link, visibility } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        sku: sku !== undefined ? sku?.trim() || null : existing.sku,
        description: description !== undefined ? description?.trim() || null : existing.description,
        brand: brand !== undefined ? brand?.trim() || 'Shineray' : existing.brand,
        categoryId: categoryId !== undefined ? categoryId || null : existing.categoryId,
        storeId: storeId !== undefined ? storeId || null : existing.storeId,
        price: price !== undefined ? Number(price) : existing.price,
        promoPrice: promoPrice !== undefined ? (promoPrice !== null ? Number(promoPrice) : null) : existing.promoPrice,
        cost: cost !== undefined ? (cost !== null ? Number(cost) : null) : existing.cost,
        margin: margin !== undefined ? (margin !== null ? Number(margin) : null) : existing.margin,
        stockStatus: stockStatus || existing.stockStatus,
        originCountry: originCountry !== undefined ? originCountry?.trim() || 'Brasil' : existing.originCountry,
        images: Array.isArray(images) ? JSON.stringify(images) : (images !== undefined ? images : existing.images),
        videoUrl: videoUrl !== undefined ? videoUrl?.trim() || null : existing.videoUrl,
        link: link !== undefined ? link?.trim() || null : existing.link,
        visibility: visibility || existing.visibility
      },
      include: { category: true }
    });

    await logAudit({
      companyId: updated.companyId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'PRODUCTS',
      recordId: id,
      details: { changes: Object.keys(req.body) },
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
  }
});

corporateRouter.delete('/products/:id', requirePermission('PRODUCTS', 'DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

    await prisma.product.delete({ where: { id } });

    await logAudit({
      companyId: product.companyId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'PRODUCTS',
      recordId: id,
      details: { name: product.name },
      req
    });

    res.json({ message: 'Produto excluído do catálogo com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro interno ao excluir produto.' });
  }
});

// ==========================================
// 7. FUNIS, OPORTUNIDADES & PEDIDOS
// ==========================================

corporateRouter.get('/pipelines', async (req, res) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { opportunities: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(pipelines);
  } catch (error) {
    console.error('Erro ao buscar funis:', error);
    res.status(500).json({ error: 'Erro interno ao buscar funis.' });
  }
});

corporateRouter.get('/loss-reasons', async (req, res) => {
  try {
    const reasons = await prisma.lossReason.findMany({ orderBy: { name: 'asc' } });
    res.json(reasons);
  } catch (error) {
    console.error('Erro ao buscar motivos de perda:', error);
    res.status(500).json({ error: 'Erro interno ao buscar motivos de perda.' });
  }
});

corporateRouter.get('/opportunities', async (req, res) => {
  try {
    const { chatId, pipelineId, stageId, status } = req.query;
    const where = {};
    if (chatId) where.chatId = chatId;
    if (pipelineId) where.pipelineId = pipelineId;
    if (stageId) where.stageId = stageId;
    if (status) where.status = status;

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        stage: true,
        pipeline: true,
        assignedUser: { select: { id: true, name: true } },
        lossReason: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(opportunities);
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    res.status(500).json({ error: 'Erro interno ao buscar oportunidades.' });
  }
});

corporateRouter.post('/opportunities', requirePermission('OPPORTUNITIES', 'CREATE'), async (req, res) => {
  try {
    const { chatId, pipelineId, stageId, title, value, probability, expectedCloseDate, notes } = req.body;
    if (!chatId || !pipelineId || !stageId || !title?.trim()) {
      return res.status(400).json({ error: 'Chat, Funil, Etapa e Título são obrigatórios.' });
    }

    const company = await prisma.company.findFirst();

    const opportunity = await prisma.opportunity.create({
      data: {
        companyId: company?.id,
        chatId,
        pipelineId,
        stageId,
        assignedUserId: req.user.id,
        title: title.trim(),
        value: Number(value) || 0.0,
        probability: Number(probability) || 50.0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes: notes?.trim() || null
      },
      include: { stage: true, pipeline: true }
    });

    // Registra na timeline do chat
    await prisma.activity.create({
      data: {
        companyId: company?.id,
        chatId,
        userId: req.user.id,
        type: 'STAGE_CHANGE',
        description: `Oportunidade aberta: "${opportunity.title}" no valor de R$ ${opportunity.value.toFixed(2)}.`
      }
    });

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    res.status(500).json({ error: 'Erro interno ao criar oportunidade.' });
  }
});

corporateRouter.put('/opportunities/:id', requirePermission('OPPORTUNITIES', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stageId, title, value, probability, expectedCloseDate, status, lossReasonId, notes } = req.body;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Oportunidade não encontrada.' });

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        stageId: stageId || existing.stageId,
        title: title !== undefined ? title.trim() : existing.title,
        value: value !== undefined ? Number(value) : existing.value,
        probability: probability !== undefined ? Number(probability) : existing.probability,
        expectedCloseDate: expectedCloseDate !== undefined ? (expectedCloseDate ? new Date(expectedCloseDate) : null) : existing.expectedCloseDate,
        status: status || existing.status,
        lossReasonId: lossReasonId !== undefined ? lossReasonId || null : existing.lossReasonId,
        notes: notes !== undefined ? notes?.trim() || null : existing.notes
      },
      include: { stage: true, pipeline: true, lossReason: true }
    });

    // Se houve mudança de etapa, registrar na timeline
    if (stageId && stageId !== existing.stageId) {
      await prisma.activity.create({
        data: {
          companyId: updated.companyId,
          chatId: updated.chatId,
          userId: req.user.id,
          type: 'STAGE_CHANGE',
          description: `Oportunidade "${updated.title}" movida para a etapa "${updated.stage.name}".`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar oportunidade:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar oportunidade.' });
  }
});

corporateRouter.get('/orders', async (req, res) => {
  try {
    const { chatId, status } = req.query;
    const where = {};
    if (chatId) where.chatId = chatId;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        assignedUser: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar pedidos.' });
  }
});

corporateRouter.post('/orders', requirePermission('ORDERS', 'CREATE'), async (req, res) => {
  try {
    const { chatId, items, notes } = req.body;
    if (!chatId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Chat e itens do pedido são obrigatórios.' });
    }

    const company = await prisma.company.findFirst();

    let totalValue = 0;
    const orderItemsData = items.map(item => {
      const subtotal = Number(item.quantity || 1) * Number(item.unitPrice || 0);
      totalValue += subtotal;
      return {
        productId: item.productId,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        subtotal
      };
    });

    const order = await prisma.order.create({
      data: {
        companyId: company?.id,
        chatId,
        assignedUserId: req.user.id,
        status: 'NEW',
        totalValue,
        notes: notes?.trim() || null,
        items: { create: orderItemsData }
      },
      include: { items: { include: { product: true } } }
    });

    // Registra na timeline
    await prisma.activity.create({
      data: {
        companyId: company?.id,
        chatId,
        userId: req.user.id,
        type: 'ORDER_CREATED',
        description: `Pedido gerado #${order.id.slice(0, 8)} com ${items.length} itens. Total: R$ ${totalValue.toFixed(2)}.`
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno ao criar pedido.' });
  }
});

// ==========================================
// 8. TAREFAS, ATIVIDADES E RESPOSTAS RÁPIDAS
// ==========================================

corporateRouter.get('/tasks', async (req, res) => {
  try {
    const { chatId, status } = req.query;
    const where = {};
    if (chatId) where.chatId = chatId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true } },
        chat: { select: { id: true, name: true, phone: true } }
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro interno ao listar tarefas.' });
  }
});

corporateRouter.post('/tasks', requirePermission('TASKS', 'CREATE'), async (req, res) => {
  try {
    const { chatId, title, description, dueDate, priority, assignedUserId } = req.body;
    if (!chatId || !title?.trim()) {
      return res.status(400).json({ error: 'Chat e título da tarefa são obrigatórios.' });
    }

    const company = await prisma.company.findFirst();

    const task = await prisma.task.create({
      data: {
        companyId: company?.id,
        chatId,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        assignedUserId: assignedUserId || req.user.id,
        status: 'PENDING'
      },
      include: { assignedUser: true }
    });

    await prisma.activity.create({
      data: {
        companyId: company?.id,
        chatId,
        userId: req.user.id,
        type: 'TASK',
        description: `Nova tarefa agendada: "${task.title}". Prazo: ${task.dueDate ? task.dueDate.toLocaleDateString('pt-BR') : 'Sem data fixa'}.`
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa.' });
  }
});

corporateRouter.put('/tasks/:id', requirePermission('TASKS', 'EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, assignedUserId } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description?.trim() || null : existing.description,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
        priority: priority || existing.priority,
        status: status || existing.status,
        assignedUserId: assignedUserId !== undefined ? assignedUserId || null : existing.assignedUserId
      },
      include: { assignedUser: true }
    });

    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await prisma.activity.create({
        data: {
          companyId: updated.companyId,
          chatId: updated.chatId,
          userId: req.user.id,
          type: 'TASK',
          description: `Tarefa concluída: "${updated.title}".`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
});

corporateRouter.get('/chats/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await prisma.activity.findMany({
      where: { chatId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(activities);
  } catch (error) {
    console.error('Erro ao listar atividades:', error);
    res.status(500).json({ error: 'Erro interno ao buscar linha do tempo.' });
  }
});

corporateRouter.get('/quick-replies', async (req, res) => {
  try {
    const replies = await prisma.quickReply.findMany({
      orderBy: [{ category: 'asc' }, { shortcut: 'asc' }]
    });
    res.json(replies);
  } catch (error) {
    console.error('Erro ao buscar respostas rápidas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar respostas rápidas.' });
  }
});

corporateRouter.post('/quick-replies', async (req, res) => {
  try {
    const { shortcut, category, title, content, mediaUrl } = req.body;
    if (!shortcut?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Atalho (ex: /financiamento) e conteúdo da mensagem são obrigatórios.' });
    }

    const company = await prisma.company.findFirst();
    const cleanShortcut = shortcut.startsWith('/') ? shortcut.trim() : `/${shortcut.trim()}`;

    const reply = await prisma.quickReply.create({
      data: {
        companyId: company?.id,
        shortcut: cleanShortcut,
        category: category?.trim() || 'GERAL',
        title: title?.trim() || cleanShortcut,
        content: content.trim(),
        mediaUrl: mediaUrl?.trim() || null
      }
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error('Erro ao criar resposta rápida:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar resposta rápida.' });
  }
});

// ==========================================
// 9. AUDITORIA
// ==========================================

corporateRouter.get('/audit-logs', requirePermission('AUDIT', 'VIEW'), async (req, res) => {
  try {
    const { resource, action, limit = 100 } = req.query;
    const where = {};
    if (resource) where.resource = resource;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error('Erro ao consultar auditoria:', error);
    res.status(500).json({ error: 'Erro interno ao buscar registros de auditoria.' });
  }
});
