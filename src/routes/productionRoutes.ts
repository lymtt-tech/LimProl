import { Router } from 'express';
import { listProductionOrders, createAndExecuteProductionOrder } from '../controllers/productionController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/production:
 *   get:
 *     summary: Lista o histórico de ordens de fabricação/produção (Permissão: ADMINISTRADOR, GERENTE, ROOT)
 *     tags: [Fabricação / Produção]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de produção.
 */
router.get('/', authorizeRoles('ADMINISTRADOR', 'GERENTE', 'ROOT'), listProductionOrders);

/**
 * @swagger
 * /api/production:
 *   post:
 *     summary: Executa uma nova Ordem de Fabricação (Dá baixa automática nos insumos e entrada no produto final) (Permissão: GERENTE, ROOT)
 *     tags: [Fabricação / Produção]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantityToProduce]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: ID_DO_PRODUTO
 *               quantityToProduce:
 *                 type: number
 *                 example: 50
 *                 description: Quantidade de produtos a fabricar
 *     responses:
 *       201:
 *         description: Fabricação concluída e estoque atualizado.
 *       400:
 *         description: Receita ausente ou insumos insuficientes no estoque.
 */
router.post('/', authorizeRoles('GERENTE', 'ROOT'), createAndExecuteProductionOrder);

export default router;
