import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota para documentação interativa do Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz com status da API e link para o Swagger
app.get('/', (req, res) => {
  res.json({
    app: 'LimProl API Backend',
    status: 'ONLINE 🚀',
    documentation: 'Acesse http://localhost:3000/docs para testar as rotas interativamente no Swagger UI',
    levels: ['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'],
  });
});

// Registrar rotas da API
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LimProl Backend Server rodando na porta ${PORT}`);
  console.log(`📘 Swagger UI disponível em: http://localhost:${PORT}/docs`);
  console.log(`=======================================================`);
});
