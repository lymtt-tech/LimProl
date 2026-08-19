import { prisma } from './prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export interface LogAuditParams {
  req?: AuthRequest;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any> | string;
}

export const logAudit = async (params: LogAuditParams) => {
  try {
    const userId = params.req?.user?.userId || params.userId || 'SYSTEM';
    const userName = params.req?.user?.name || params.userName || 'Sistema';
    const userRole = params.req?.user?.role || params.userRole || 'SYSTEM';
    const ipAddress = params.req?.ip || params.req?.socket?.remoteAddress || '127.0.0.1';

    const detailsStr = typeof params.details === 'object' ? JSON.stringify(params.details) : params.details;

    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        userRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: detailsStr,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Erro ao gravar log de auditoria:', error);
  }
};
