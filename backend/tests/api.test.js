const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Escuta em porta efêmera (0) para evitar conflitos de portas
    server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      baseUrl = `http://localhost:${address.port}`;
      console.log(`[TEST SERVER] Rodando em ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('1. Health Check - GET /api/health deve retornar status 200', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('2. Filmes - GET /api/filmes deve listar os filmes cadastrados', async () => {
  const res = await fetch(`${baseUrl}/api/filmes`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length > 0);
});

test('3. Filmes - POST /api/filmes deve cadastrar um novo filme com sucesso', async () => {
  const novoFilme = {
    titulo: 'Matrix Revolutions',
    sinopse: 'A guerra final entre a humanidade e as máquinas atinge seu ápice.',
    duracao: 129,
    classificacao_indicativa: '14 anos'
  };

  const res = await fetch(`${baseUrl}/api/filmes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoFilme)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.titulo, 'Matrix Revolutions');
  assert.equal(json.data.duracao, 129);
});

test('4. Filmes - POST /api/filmes deve falhar com 400 se campos obrigatórios faltarem', async () => {
  const res = await fetch(`${baseUrl}/api/filmes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sinopse: 'Filme sem título' })
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('5. Salas - GET /api/salas deve listar as salas disponíveis', async () => {
  const res = await fetch(`${baseUrl}/api/salas`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length > 0);
});

test('6. Salas - POST /api/salas deve criar uma nova sala', async () => {
  const novaSala = {
    nome: 'Sala 4 - ScreenX 270 Graus',
    capacidade_assentos: 60
  };

  const res = await fetch(`${baseUrl}/api/salas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaSala)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.nome, 'Sala 4 - ScreenX 270 Graus');
  assert.equal(json.data.capacidade_assentos, 60);
});

test('7. Sessões - GET /api/sessoes deve retornar o catálogo com joins de filmes e salas', async () => {
  const res = await fetch(`${baseUrl}/api/sessoes`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length > 0);

  const primeiraSessao = json.data[0];
  assert.ok(primeiraSessao.filme_id);
  assert.ok(primeiraSessao.sala_id);
  assert.ok(primeiraSessao.filmes, 'Deveria conter dados do filme');
  assert.ok(primeiraSessao.salas, 'Deveria conter dados da sala');
  assert.ok(typeof primeiraSessao.assentos_disponiveis === 'number');
  assert.ok(typeof primeiraSessao.capacidade_total === 'number');
});

test('8. Sessões - POST /api/sessoes deve cadastrar nova sessão com validação de capacidade', async () => {
  // Pega um filme e uma sala existentes
  const [resFilmes, resSalas] = await Promise.all([
    fetch(`${baseUrl}/api/filmes`),
    fetch(`${baseUrl}/api/salas`)
  ]);
  const jsonFilmes = await resFilmes.json();
  const jsonSalas = await resSalas.json();

  const filme = jsonFilmes.data[0];
  const sala = jsonSalas.data[0];

  const novaSessao = {
    filme_id: filme.id,
    sala_id: sala.id,
    data_exibicao: '2026-10-15',
    horario_inicio: '21:00:00',
    horario_termino: '23:30:00',
    preco: 45.00
  };

  const res = await fetch(`${baseUrl}/api/sessoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaSessao)
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  // Deve herdar automaticamente a capacidade da sala se assentos_disponiveis não for enviado
  assert.equal(json.data.assentos_disponiveis, sala.capacidade_assentos);
});

test('9. Sessões - PATCH /api/sessoes/:id/reservar deve decrementar vagas disponíveis', async () => {
  const resSessoes = await fetch(`${baseUrl}/api/sessoes`);
  const jsonSessoes = await resSessoes.json();
  const sessao = jsonSessoes.data[0];

  const vagasIniciais = sessao.assentos_disponiveis;

  const res = await fetch(`${baseUrl}/api/sessoes/${sessao.id}/reservar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidade: 2 })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.assentos_disponiveis, vagasIniciais - 2);
});

test('10. Sessões - DELETE /api/sessoes/:id deve excluir uma sessão existente', async () => {
  const resSessoes = await fetch(`${baseUrl}/api/sessoes`);
  const jsonSessoes = await resSessoes.json();
  const sessaoParaDeletar = jsonSessoes.data[jsonSessoes.data.length - 1];

  const res = await fetch(`${baseUrl}/api/sessoes/${sessaoParaDeletar.id}`, {
    method: 'DELETE'
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
});

test('11. Tratamento de Erro - Endpoint inexistente deve responder com 404', async () => {
  const res = await fetch(`${baseUrl}/api/rota-inexistente-123`);
  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.success, false);
});
