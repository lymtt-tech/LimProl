import { Response } from 'express';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

export const listProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        recipe: {
          include: {
            items: {
              include: { supply: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar produtos.' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, unit, stockQuantity, minStock, price } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({ message: 'Nome, categoria e unidade são obrigatórios.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unit,
        stockQuantity: Number(stockQuantity) || 0,
        minStock: Number(minStock) || 0,
        price: Number(price) || 0,
      },
    });

    await logAudit({
      req,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      details: `Cadastrado produto de limpeza: ${product.name} (${product.unit}) a R$ ${product.price}`,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cadastrar produto.' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, unit, stockQuantity, minStock, price } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(unit && { unit }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(minStock !== undefined && { minStock: Number(minStock) }),
        ...(price !== undefined && { price: Number(price) }),
      },
    });

    await logAudit({
      req,
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: id,
      details: `Produto ${updated.name} atualizado. Novo preço: R$ ${updated.price}, Novo Estoque: ${updated.stockQuantity}`,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar produto.' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    await prisma.product.delete({ where: { id } });

    await logAudit({
      req,
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: id,
      details: `Produto ${existing.name} foi excluído do sistema.`,
    });

    return res.json({ message: `Produto ${existing.name} excluído com sucesso.` });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir produto.' });
  }
};

export const setProductRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // productId
    const { description, items } = req.body; // items: [{ supplyId, quantityRequired }]

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'A fórmula precisa conter ao menos uma matéria-prima em "items".' });
    }

    // Deleta receita existente se houver
    await prisma.recipe.deleteMany({ where: { productId: id } });

    const newRecipe = await prisma.recipe.create({
      data: {
        productId: id,
        description: description || `Fórmula de fabricação para ${product.name}`,
        items: {
          create: items.map((item: { supplyId: string; quantityRequired: number }) => ({
            supplyId: item.supplyId,
            quantityRequired: Number(item.quantityRequired),
          })),
        },
      },
      include: {
        items: { include: { supply: true } },
      },
    });

    await logAudit({
      req,
      action: 'SET_PRODUCT_RECIPE',
      entity: 'Recipe',
      entityId: newRecipe.id,
      details: `Definida fórmula/receita de produção para o produto ${product.name} com ${items.length} insumos.`,
    });

    return res.json(newRecipe);
  } catch (error) {
    console.error('Erro ao definir fórmula:', error);
    return res.status(500).json({ message: 'Erro ao salvar receita do produto.' });
  }
};
