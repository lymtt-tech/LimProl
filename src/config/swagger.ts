import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LimProl API - Gestão de Estoque, Fabricação e Vendas de Produtos de Limpeza',
      version: '1.0.0',
      description: `
API RESTful para a empresa LimProl com suporte a 4 níveis de controle de acesso (RBAC):
- **VENDEDOR**: Acesso ao catálogo de produtos e lançamento de vendas.
- **ADMINISTRADOR**: Cadastro de matérias-primas e produtos de limpeza.
- **GERENTE**: Gestão de usuários, ordens de produção e fórmulas de limpeza.
- **ROOT**: Nível Desenvolvedor/T.I com acesso total, logs de auditoria e rastreabilidade irrestrita.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT retornado no endpoint de login.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
