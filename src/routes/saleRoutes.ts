import { Router } from 'express';
import { listSales, createSale } from '../controllers/saleController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Lista o histórico de vendas realizadas (Permissão: Todos)
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de vendas.
 */
router.get('/', authorizeRoles('VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'), listSales);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Registra uma nova venda de produtos de limpeza (Permissão: Todos)
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Mercado São José
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: ID_DO_PRODUTO
 *                     quantity:
 *                       type: number
 *                       example: 10
 *     responses:
 *       201:
 *         description: Venda registrada e estoque baixado.
 *       400:
 *         description: Estoque insuficiente para os itens.
 */
router.post('/', authorizeRoles('VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'), createSale);

export default router;
