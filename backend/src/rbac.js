import { prisma } from './db.js';

/**
 * Registra um evento formal na trilha de auditoria do SQLite.
 */
export async function logAudit({ companyId, userId, action, resource, recordId = null, details = null, req = null }) {
  try {
    let ipAddress = null;
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    }

    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

    return await prisma.auditLog.create({
      data: {
        companyId: companyId || null,
        userId: userId || null,
        action,
        resource,
        recordId: recordId ? String(recordId) : null,
        details: detailsStr,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 45) : null
      }
    });
  } catch (error) {
    console.error('[AuditLog] Erro ao registrar auditoria:', error);
  }
}

/**
 * Verifica se o usuário possui a permissão requerida respeitando a regra de precedência:
 * 1. NEGADO EXPLICITAMENTE (UserPermissionException com granted = false) -> false
 * 2. EXCEÇÃO POSITIVA (UserPermissionException com granted = true) -> true (com escopo da exceção)
 * 3. PERMISSÃO DO CARGO (RolePermission) -> true (com escopo do cargo)
 * 4. ADMIN do sistema legado (role === 'ADMIN') -> true (escopo ALL)
 * 5. PADRÃO -> false
 */
export async function checkPermission(userId, resource, action, targetEntity = null) {
  if (!userId) return { allowed: false, reason: 'Usuário não identificado.' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionExceptions: {
        where: {
          permission: { resource, action }
        }
      },
      roleRel: {
        include: {
          permissions: {
            where: {
              permission: { resource, action }
            }
          }
        }
      }
    }
  });

  if (!user || !user.isActive) {
    return { allowed: false, reason: 'Usuário inativo ou inexistente.' };
  }

  // 1. Bloqueio explícito prioritário do usuário
  const explicitDeny = user.permissionExceptions?.find(e => !e.granted);
  if (explicitDeny) {
    return { allowed: false, reason: 'Permissão explicitamente negada para este usuário.' };
  }

  // 2. Exceção positiva do usuário (com verificação de expiração temporal se houver)
  const exceptionGrant = user.permissionExceptions?.find(e => e.granted);
  if (exceptionGrant) {
    if (exceptionGrant.validUntil && new Date() > new Date(exceptionGrant.validUntil)) {
      // Expirou a permissão temporária
    } else {
      const scope = exceptionGrant.scopeOverride || user.roleRel?.scope || 'OWN';
      return validateScope(user, scope, targetEntity);
    }
  }

  // 3. Permissão do Cargo
  const rolePermission = user.roleRel?.permissions?.[0];
  if (rolePermission && rolePermission.granted) {
    const scope = rolePermission.scope || user.roleRel?.scope || 'OWN';
    return validateScope(user, scope, targetEntity);
  }

  // 4. Fallback legado de ADMIN pleno
  if (user.role === 'ADMIN') {
    return { allowed: true, scope: 'ALL' };
  }

  return { allowed: false, reason: 'Cargo ou perfil sem permissão para esta ação.' };
}

/**
 * Valida se o recurso alvo respeita o escopo concedido ao usuário.
 */
function validateScope(user, scope, target) {
  if (scope === 'ALL' || scope === 'COMPANY') {
    return { allowed: true, scope };
  }

  if (!target) {
    // Se não há entidade alvo específica (ex: listar coleção), o escopo é retornado para filtragem
    return { allowed: true, scope };
  }

  if (scope === 'STORE') {
    if (target.storeId && user.storeId && target.storeId === user.storeId) {
      return { allowed: true, scope };
    }
    return { allowed: false, reason: 'Acesso restrito à filial do operador.' };
  }

  if (scope === 'TEAM') {
    if (target.teamId && user.teamId && target.teamId === user.teamId) {
      return { allowed: true, scope };
    }
    return { allowed: false, reason: 'Acesso restrito à equipe do operador.' };
  }

  if (scope === 'OWN') {
    const isOwner =
      target.assignedUserId === user.id ||
      target.userId === user.id ||
      target.id === user.id;

    if (isOwner) {
      return { allowed: true, scope };
    }
    return { allowed: false, reason: 'Acesso permitido apenas a registros atribuídos a você.' };
  }

  return { allowed: false, reason: 'Escopo inválido ou restrito.' };
}

/**
 * Middleware Express para proteger rotas por Recurso e Ação
 */
export function requirePermission(resource, action, getTargetEntityFn = null) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Acesso não autenticado.' });
      }

      let targetEntity = null;
      if (getTargetEntityFn) {
        targetEntity = await getTargetEntityFn(req);
      }

      const check = await checkPermission(req.user.id, resource, action, targetEntity);
      if (!check.allowed) {
        return res.status(403).json({
          error: `Acesso negado: ${check.reason || 'Permissão insuficiente.'}`,
          required: { resource, action }
        });
      }

      req.permissionScope = check.scope;
      next();
    } catch (err) {
      console.error('[RBAC Middleware Error]:', err);
      return res.status(500).json({ error: 'Erro interno ao validar permissões de acesso.' });
    }
  };
}

/**
 * Impede que o último administrador ativo seja excluído, desativado ou rebaixado.
 */
export async function assertNotLastAdmin(userIdToModify, newRole = null, willBeActive = true) {
  const user = await prisma.user.findUnique({
    where: { id: userIdToModify },
    include: { roleRel: true }
  });

  if (!user) return;

  const isAdmin = user.role === 'ADMIN' || user.roleRel?.name === 'ADMINISTRADOR';
  if (!isAdmin) return;

  // Se continuar sendo admin e ativo, tudo bem
  if (willBeActive && (newRole === 'ADMIN' || newRole === 'ADMINISTRADOR')) {
    return;
  }

  // Conta quantos outros admins ativos existem
  const otherAdminsCount = await prisma.user.count({
    where: {
      id: { not: userIdToModify },
      isActive: true,
      OR: [
        { role: 'ADMIN' },
        { roleRel: { name: 'ADMINISTRADOR' } }
      ]
    }
  });

  if (otherAdminsCount === 0) {
    throw new Error('Operação bloqueada: Não é permitido remover, desativar ou rebaixar o único Administrador ativo do sistema.');
  }
}
