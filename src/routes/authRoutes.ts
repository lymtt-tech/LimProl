import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login na API do LimProl
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: root@limprol.com.br
 *               password:
 *                 type: string
 *                 example: root123
 *     responses:
 *       200:
 *         description: Login bem-sucedido com retorno do Token JWT.
 *       401:
 *         description: Credenciais inválidas.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna as informações do usuário autenticado no token atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado.
 *       401:
 *         description: Token não informado ou inválido.
 */
router.get('/me', authenticateToken, getMe);

export default router;
