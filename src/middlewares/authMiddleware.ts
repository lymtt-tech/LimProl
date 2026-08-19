import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE' | 'ROOT';
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso não autorizado. Token JWT ausente.' });
  }

  const secret = process.env.JWT_SECRET || 'limprol_super_secret_jwt_key_2026_dev_prod';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token JWT inválido ou expirado.' });
  }
};

export const authorizeRoles = (...allowedRoles: Array<'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE' | 'ROOT'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Nível ROOT tem acesso total e irrestrito a todas as rotas
    if (req.user.role === 'ROOT') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acesso negado. O seu perfil (${req.user.role}) não possui permissão para este recurso. Nível exigido: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};
