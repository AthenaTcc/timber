const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🎬 Cinema API rodando com sucesso na porta: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🍿 Catálogo de Sessões: http://localhost:${PORT}/api/sessoes`);
  console.log(`🎞️  Filmes: http://localhost:${PORT}/api/filmes`);
  console.log(`🚪 Salas: http://localhost:${PORT}/api/salas`);
  console.log('====================================================');
});
