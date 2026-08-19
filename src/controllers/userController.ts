import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';
import { USER_ROLES, UserRole } from '../types/roles.js';

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar usuários.' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios (name, email, password, role).' });
    }

    if (!USER_ROLES.includes(role as UserRole)) {
      return res.status(400).json({ message: `Função (role) inválida. Opções: ${USER_ROLES.join(', ')}` });
    }

    // Regra RBAC: GERENTE não pode criar outro GERENTE nem ROOT. Apenas ROOT pode criar GERENTE e ROOT.
    if (req.user?.role === 'GERENTE' && (role === 'GERENTE' || role === 'ROOT')) {
      return res.status(403).json({ message: 'Um GERENTE só pode cadastrar perfis VENDEDOR e ADMINISTRADOR.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as string,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await logAudit({
      req,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      details: `Novo usuário cadastrado: ${newUser.name} com papel de ${newUser.role}`,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !USER_ROLES.includes(role as UserRole)) {
      return res.status(400).json({ message: 'Permissão (role) inválida.' });
    }

    if (req.user?.role === 'GERENTE' && (role === 'GERENTE' || role === 'ROOT')) {
      return res.status(403).json({ message: 'Apenas ROOT pode atribuir o nível de GERENTE ou ROOT.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as string },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit({
      req,
      action: 'UPDATE_USER_ROLE',
      entity: 'User',
      entityId: id,
      details: `Função do usuário ${updatedUser.name} alterada para ${role}`,
    });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar nível do usuário.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === req.user?.userId) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta.' });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await prisma.user.delete({ where: { id } });

    await logAudit({
      req,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      details: `Usuário ${userToDelete.name} (${userToDelete.email}) foi excluído do sistema.`,
    });

    return res.json({ message: `Usuário ${userToDelete.name} excluído com sucesso.` });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
};
