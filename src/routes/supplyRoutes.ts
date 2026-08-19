import { Router } from 'express';
import { listSupplies, createSupply, updateSupply, deleteSupply } from '../controllers/supplyController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/supplies:
 *   get:
 *     summary: Lista todas as matérias-primas/insumos com lote e data de validade (Permissão: Todos)
 *     tags: [Matérias-Primas (Insumos)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de matérias-primas.
 */
router.get('/', authorizeRoles('VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'), listSupplies);

/**
 * @swagger
 * /api/supplies:
 *   post:
 *     summary: Cadastra uma nova matéria-prima com lote, fornecedor e datas (Permissão: ADMINISTRADOR, GERENTE, ROOT)
 *     tags: [Matérias-Primas (Insumos)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, unit]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lauril Éter Sulfato de Sódio 27%
 *               unit:
 *                 type: string
 *                 example: L
 *               stockQuantity:
 *                 type: number
 *                 example: 500
 *               minStock:
 *                 type: number
 *                 example: 100
 *               costPerUnit:
 *                 type: number
 *                 example: 8.50
 *               batchNumber:
 *                 type: string
 *                 example: LT-2026-089A
 *               supplier:
 *                 type: string
 *                 example: Química do Brasil Ltda
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-01
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: 2027-08-01
 *     responses:
 *       201:
 *         description: Matéria-prima cadastrada com sucesso.
 */
router.post('/', authorizeRoles('ADMINISTRADOR', 'GERENTE', 'ROOT'), createSupply);

/**
 * @swagger
 * /api/supplies/{id}:
 *   put:
 *     summary: Atualiza dados de matéria-prima (Permissão: ADMINISTRADOR, GERENTE, ROOT)
 *     tags: [Matérias-Primas (Insumos)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               stockQuantity:
 *                 type: number
 *               minStock:
 *                 type: number
 *               costPerUnit:
 *                 type: number
 *               batchNumber:
 *                 type: string
 *               supplier:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Matéria-prima atualizada.
 */
router.put('/:id', authorizeRoles('ADMINISTRADOR', 'GERENTE', 'ROOT'), updateSupply);

/**
 * @swagger
 * /api/supplies/{id}:
 *   delete:
 *     summary: Exclui uma matéria-prima (Permissão: GERENTE, ROOT)
 *     tags: [Matérias-Primas (Insumos)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matéria-prima excluída.
 */
router.delete('/:id', authorizeRoles('GERENTE', 'ROOT'), deleteSupply);

export default router;
