import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Rastreabilidade irrestrita de ações do sistema (Exclusivo: GERENTE, ROOT)
 *     tags: [Auditoria & Rastreabilidade (ROOT)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por ação (ex: CREATE_USER, EXECUTE_PRODUCTION, CREATE_SALE, etc.)
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filtrar por entidade (User, Product, Supply, Sale, ProductionOrder)
 *     responses:
 *       200:
 *         description: Logs de auditoria retornados com sucesso.
 *       403:
 *         description: Acesso negado.
 */
router.get('/', authorizeRoles('GERENTE', 'ROOT'), listAuditLogs);

export default router;
