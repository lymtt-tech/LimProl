import { Response } from 'express';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const listAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { action, entity, userRole } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action && { action: String(action) }),
        ...(entity && { entity: String(entity) }),
        ...(userRole && { userRole: String(userRole) }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limite dos últimos 100 eventos
    });

    return res.json({
      total: logs.length,
      description: 'Logs de auditoria e rastreabilidade irrestrita do sistema LimProl',
      logs,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar logs de auditoria.' });
  }
};
