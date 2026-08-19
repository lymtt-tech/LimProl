import { Response } from 'express';
import { prisma } from '../utils/prismaClient.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

export const listSupplies = async (req: AuthRequest, res: Response) => {
  try {
    const supplies = await prisma.supply.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(supplies);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar matérias-primas.' });
  }
};

export const createSupply = async (req: AuthRequest, res: Response) => {
  try {
    const { name, unit, stockQuantity, minStock, costPerUnit, batchNumber, supplier, purchaseDate, expirationDate } = req.body;

    if (!name || !unit) {
      return res.status(400).json({ message: 'Nome e unidade (ex: L, Kg, Unid) são obrigatórios.' });
    }

    const supply = await prisma.supply.create({
      data: {
        name,
        unit,
        stockQuantity: Number(stockQuantity) || 0,
        minStock: Number(minStock) || 0,
        costPerUnit: Number(costPerUnit) || 0,
        batchNumber: batchNumber || null,
        supplier: supplier || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    await logAudit({
      req,
      action: 'CREATE_SUPPLY',
      entity: 'Supply',
      entityId: supply.id,
      details: `Cadastrada matéria-prima: "${supply.name}" (Lote: ${supply.batchNumber || 'N/A'}, Fornecedor: ${supply.supplier || 'N/A'}, Validade: ${supply.expirationDate ? supply.expirationDate.toISOString().split('T')[0] : 'N/A'})`,
    });

    return res.status(201).json(supply);
  } catch (error) {
    console.error('Erro ao cadastrar matéria-prima:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar matéria-prima.' });
  }
};

export const updateSupply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, stockQuantity, minStock, costPerUnit, batchNumber, supplier, purchaseDate, expirationDate } = req.body;

    const existing = await prisma.supply.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Matéria-prima não encontrada.' });
    }

    const updated = await prisma.supply.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(unit && { unit }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(minStock !== undefined && { minStock: Number(minStock) }),
        ...(costPerUnit !== undefined && { costPerUnit: Number(costPerUnit) }),
        ...(batchNumber !== undefined && { batchNumber }),
        ...(supplier !== undefined && { supplier }),
        ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
      },
    });

    await logAudit({
      req,
      action: 'UPDATE_SUPPLY',
      entity: 'Supply',
      entityId: id,
      details: `Atualizada matéria-prima "${updated.name}". Lote: ${updated.batchNumber || 'N/A'}, Novo Estoque: ${updated.stockQuantity} ${updated.unit}`,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar matéria-prima.' });
  }
};

export const deleteSupply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.supply.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Matéria-prima não encontrada.' });
    }

    await prisma.supply.delete({ where: { id } });

    await logAudit({
      req,
      action: 'DELETE_SUPPLY',
      entity: 'Supply',
      entityId: id,
      details: `Excluída matéria-prima: "${existing.name}" (Lote: ${existing.batchNumber || 'N/A'})`,
    });

    return res.json({ message: `Matéria-prima ${existing.name} excluída.` });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir matéria-prima.' });
  }
};
