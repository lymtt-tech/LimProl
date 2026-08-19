import bcrypt from 'bcryptjs';
import { prisma } from './prismaClient.js';

async function seed() {
  console.log('🧹 Zerando banco de dados do LimProl (Modo Produção Limpo)...');

  // Limpar totalmente todas as tabelas
  await prisma.auditLog.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supply.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Banco de dados zerado com sucesso! Nenhuma matéria-prima ou produto cadastrado.');

  // Criar apenas os 4 usuários padrão do sistema para os níveis de acesso
  const passwordHash = await bcrypt.hash('123456', 10);
  const rootPasswordHash = await bcrypt.hash('root123', 10);

  const rootUser = await prisma.user.create({
    data: {
      name: 'Desenvolvedor T.I (ROOT)',
      email: 'root@limprol.com.br',
      password: rootPasswordHash,
      role: 'ROOT',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Carlos Gerente',
      email: 'gerente@limprol.com.br',
      password: passwordHash,
      role: 'GERENTE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ana Administradora',
      email: 'admin@limprol.com.br',
      password: passwordHash,
      role: 'ADMINISTRADOR',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Marcos Vendedor',
      email: 'vendedor@limprol.com.br',
      password: passwordHash,
      role: 'VENDEDOR',
    },
  });

  console.log('✅ Usuários do sistema criados:');
  console.log(` - ROOT: root@limprol.com.br (Senha: root123)`);
  console.log(` - GERENTE: gerente@limprol.com.br (Senha: 123456)`);
  console.log(` - ADMINISTRADOR: admin@limprol.com.br (Senha: 123456)`);
  console.log(` - VENDEDOR: vendedor@limprol.com.br (Senha: 123456)`);

  // Registrar o evento no Audit Log
  await prisma.auditLog.create({
    data: {
      userId: rootUser.id,
      userName: rootUser.name,
      userRole: rootUser.role,
      action: 'SYSTEM_RESET',
      entity: 'System',
      details: 'Banco de dados zerado e mantido limpo para uso em produção.',
    },
  });

  console.log('🚀 Base zerada e pronta para inserção de dados reais!');
}

seed()
  .catch((e) => {
    console.error('❌ Erro ao zerar banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
