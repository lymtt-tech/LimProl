import { Router } from 'express';
import { listProducts, createProduct, updateProduct, deleteProduct, setProductRecipe } from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista todos os produtos de limpeza e suas receitas (Permissão: Todos)
 *     tags: [Produtos de Limpeza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos acabados.
 */
router.get('/', authorizeRoles('VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'), listProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Cadastra um novo produto de limpeza (Permissão: ADMINISTRADOR, GERENTE, ROOT)
 *     tags: [Produtos de Limpeza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, unit, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Detergente Neutro 500ml
 *               category:
 *                 type: string
 *                 example: Detergentes
 *               unit:
 *                 type: string
 *                 example: 500ml
 *               stockQuantity:
 *                 type: number
 *                 example: 100
 *               minStock:
 *                 type: number
 *                 example: 20
 *               price:
 *                 type: number
 *                 example: 3.50
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso.
 */
router.post('/', authorizeRoles('ADMINISTRADOR', 'GERENTE', 'ROOT'), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Atualiza informações ou preço do produto (Permissão: ADMINISTRADOR, GERENTE, ROOT)
 *     tags: [Produtos de Limpeza]
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
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *               stockQuantity:
 *                 type: number
 *               minStock:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produto atualizado.
 */
router.put('/:id', authorizeRoles('ADMINISTRADOR', 'GERENTE', 'ROOT'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Exclui um produto do sistema (Permissão: GERENTE, ROOT)
 *     tags: [Produtos de Limpeza]
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
 *         description: Produto excluído.
 */
router.delete('/:id', authorizeRoles('GERENTE', 'ROOT'), deleteProduct);

/**
 * @swagger
 * /api/products/{id}/recipe:
 *   post:
 *     summary: Define ou atualiza a fórmula/receita de fabricação do produto (Permissão: GERENTE, ROOT)
 *     tags: [Produtos de Limpeza]
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
 *             required: [items]
 *             properties:
 *               description:
 *                 type: string
 *                 example: Fórmula padrão de detergente neutro concentrado
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [supplyId, quantityRequired]
 *                   properties:
 *                     supplyId:
 *                       type: string
 *                       description: ID da matéria-prima (ex: Lauril)
 *                     quantityRequired:
 *                       type: number
 *                       example: 0.1
 *                       description: Quantidade necessária desta matéria-prima por 1 UNIDADE deste produto
 *     responses:
 *       200:
 *         description: Receita salva com sucesso.
 */
router.post('/:id/recipe', authorizeRoles('GERENTE', 'ROOT'), setProductRecipe);

export default router;
