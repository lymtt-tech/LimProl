import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const secret = process.env.JWT_SECRET || 'limprol_super_secret_jwt_key_2026_dev_prod';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '24h' }
    );

    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: `Usuário ${user.name} (${user.role}) realizou login com sucesso.`,
    });

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar perfil do usuário.' });
  }
};
