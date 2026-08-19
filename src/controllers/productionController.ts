import { Response } from 'express';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

export const listProductionOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: {
        product: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar ordens de produção.' });
  }
};

export const createAndExecuteProductionOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantityToProduce } = req.body;

    if (!productId || !quantityToProduce || Number(quantityToProduce) <= 0) {
      return res.status(400).json({ message: 'ID do produto e quantidade a produzir (>0) são obrigatórios.' });
    }

    const qty = Number(quantityToProduce);

    // Buscar produto e sua receita
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        recipe: {
          include: {
            items: {
              include: { supply: true },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    if (!product.recipe || product.recipe.items.length === 0) {
      return res.status(400).json({
        message: `O produto "${product.name}" não possui uma fórmula/receita cadastrada. Cadastre a receita antes de produzir.`,
      });
    }

    // Verificar se há insumos suficientes no estoque
    const missingSupplies: string[] = [];

    for (const item of product.recipe.items) {
      const totalNeeded = item.quantityRequired * qty;
      if (item.supply.stockQuantity < totalNeeded) {
        missingSupplies.push(
          `${item.supply.name}: Necessário ${totalNeeded} ${item.supply.unit}, Disponível em estoque: ${item.supply.stockQuantity} ${item.supply.unit}`
        );
      }
    }

    if (missingSupplies.length > 0) {
      return res.status(400).json({
        message: 'Estoque de matérias-primas insuficiente para realizar esta ordem de fabricação.',
        details: missingSupplies,
      });
    }

    // Executar transação atômica no banco: dar baixa nos insumos, dar entrada no produto acabado e registrar a ordem
    const result = await prisma.$transaction(async (tx) => {
      // 1. Dar baixa em cada matéria-prima
      for (const item of product.recipe!.items) {
        const totalNeeded = item.quantityRequired * qty;
        await tx.supply.update({
          where: { id: item.supplyId },
          data: {
            stockQuantity: {
              decrement: totalNeeded,
            },
          },
        });
      }

      // 2. Incrementar estoque do produto final acabado
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: qty,
          },
        },
      });

      // 3. Registrar a Ordem de Produção Concluída
      const order = await tx.productionOrder.create({
        data: {
          productId,
          quantityToProduce: qty,
          status: 'COMPLETED',
          createdById: req.user!.userId,
          completedAt: new Date(),
        },
        include: {
          product: true,
        },
      });

      return { order, updatedProduct };
    });

    await logAudit({
      req,
      action: 'EXECUTE_PRODUCTION',
      entity: 'ProductionOrder',
      entityId: result.order.id,
      details: `Ordem de Produção Concluída: Fabricados ${qty} unidades de "${product.name}". Insumos baixados com sucesso.`,
    });

    return res.status(201).json({
      message: `Ordem de fabricação concluída com sucesso! Foram produzidos ${qty} ${product.unit} de "${product.name}".`,
      order: result.order,
      newProductStock: result.updatedProduct.stockQuantity,
    });
  } catch (error) {
    console.error('Erro na produção:', error);
    return res.status(500).json({ message: 'Erro interno ao processar ordem de produção.' });
  }
};
