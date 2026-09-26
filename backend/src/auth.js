import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shineray_crm_jwt_production_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Gera um token JWT assinado para o usuário.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifica e decodifica um token JWT.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware Express para proteger rotas da API com JWT.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Token de autenticação não fornecido.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Sessão expirada ou token inválido. Por favor, autentique-se novamente.'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Usuário inativo ou inexistente.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Erro ao validar usuário no banco:', error);
    return res.status(500).json({ error: 'Erro interno na validação de autenticação.' });
  }
}

/**
 * Middleware para exigir perfil específico (ex: ADMIN).
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado. Nível de permissão insuficiente para executar esta ação.'
      });
    }
    next();
  };
}
