import { Router } from 'express';
import { listUsers, createUser, updateUserRole, deleteUser } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários (Permissão: GERENTE, ROOT)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários cadastrados.
 *       403:
 *         description: Acesso negado.
 */
router.get('/', authorizeRoles('GERENTE', 'ROOT'), listUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cadastra um novo usuário no sistema (Permissão: GERENTE, ROOT)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Vendedor
 *               email:
 *                 type: string
 *                 example: joao@limprol.com.br
 *               password:
 *                 type: string
 *                 example: senha123
 *               role:
 *                 type: string
 *                 enum: [VENDEDOR, ADMINISTRADOR, GERENTE, ROOT]
 *                 example: VENDEDOR
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 */
router.post('/', authorizeRoles('GERENTE', 'ROOT'), createUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Atualiza o nível de acesso/permissão de um usuário (Permissão: GERENTE, ROOT)
 *     tags: [Usuários]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [VENDEDOR, ADMINISTRADOR, GERENTE, ROOT]
 *     responses:
 *       200:
 *         description: Permissão atualizada.
 */
router.put('/:id/role', authorizeRoles('GERENTE', 'ROOT'), updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Exclui um usuário do sistema (Exclusivo: ROOT)
 *     tags: [Usuários]
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
 *         description: Usuário excluído com sucesso.
 *       403:
 *         description: Apenas ROOT pode excluir usuários.
 */
router.delete('/:id', authorizeRoles('ROOT'), deleteUser);

export default router;
