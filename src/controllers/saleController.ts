import { Response } from 'express';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

export const listSales = async (req: AuthRequest, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        seller: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar vendas.' });
  }
};

export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const { items, customerName } = req.body; // items: [{ productId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'A venda deve conter ao menos 1 item em "items".' });
    }

    // Verificar estoque para todos os produtos da venda
    const insufficientStock: string[] = [];
    const preparedItems: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number; productName: string }> = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ message: `Produto com ID ${item.productId} não foi encontrado.` });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ message: `Quantidade inválida para o produto ${product.name}.` });
      }

      if (product.stockQuantity < qty) {
        insufficientStock.push(
          `${product.name}: Estoque atual é de ${product.stockQuantity} ${product.unit}, mas a venda solicita ${qty} ${product.unit}`
        );
      } else {
        const subtotal = product.price * qty;
        totalAmount += subtotal;
        preparedItems.push({
          productId: product.id,
          quantity: qty,
          unitPrice: product.price,
          subtotal,
          productName: product.name,
        });
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: 'Estoque insuficiente de produtos acabados para finalizar esta venda.',
        details: insufficientStock,
      });
    }

    // Processar venda atômica no banco de dados
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Dar baixa no estoque dos produtos acabados
      for (const item of preparedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Criar a Venda e os itens
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          sellerId: req.user!.userId,
          customerName: customerName || 'Cliente Balcão',
          items: {
            create: preparedItems.map((pi) => ({
              productId: pi.productId,
              quantity: pi.quantity,
              unitPrice: pi.unitPrice,
              subtotal: pi.subtotal,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          seller: { select: { id: true, name: true, role: true } },
        },
      });

      return newSale;
    });

    await logAudit({
      req,
      action: 'CREATE_SALE',
      entity: 'Sale',
      entityId: sale.id,
      details: `Venda #${sale.id.slice(0, 8)} realizada por ${req.user!.name} (${req.user!.role}). Total: R$ ${totalAmount.toFixed(2)}`,
    });

    return res.status(201).json({
      message: 'Venda realizada com sucesso!',
      sale,
    });
  } catch (error) {
    console.error('Erro ao realizar venda:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar venda.' });
  }
};
