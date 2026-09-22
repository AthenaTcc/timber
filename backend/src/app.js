const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const filmesRoutes = require('./routes/filmesRoutes');
const salasRoutes = require('./routes/salasRoutes');
const sessoesRoutes = require('./routes/sessoesRoutes');

const app = express();

// Middlewares essenciais
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz e Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🎬 Cinema Management API está operante!',
    version: '1.0.0',
    endpoints: {
      filmes: '/api/filmes',
      salas: '/api/salas',
      sessoes: '/api/sessoes'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vinculação de rotas da API
app.use('/api/filmes', filmesRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/sessoes', sessoesRoutes);

// Tratamento de rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`
  });
});

// Middleware de tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro na requisição:', err);
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Erro interno no servidor.',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

module.exports = app;
