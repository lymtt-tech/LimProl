import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import supplyRoutes from './supplyRoutes.js';
import productRoutes from './productRoutes.js';
import productionRoutes from './productionRoutes.js';
import saleRoutes from './saleRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/supplies', supplyRoutes);
router.use('/products', productRoutes);
router.use('/production', productionRoutes);
router.use('/sales', saleRoutes);
router.use('/audit', auditRoutes);

export default router;
