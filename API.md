# 📖 Documentação da API REST - CineTimber

API RESTful para gestão de catálogo de cinema, salas de exibição e sessões com controle dinâmico de assentos.

- **Base URL Local**: `http://localhost:3000`
- **Prefixo da API**: `/api`
- **Formato dos Dados**: `application/json`

---

## 📑 Índice dos Endpoints

1. [Diagnóstico & Saúde](#1-diagnóstico--saúde)
   - `GET /api/health`
2. [Filmes](#2-filmes)
   - `GET /api/filmes`
   - `GET /api/filmes/:id`
   - `POST /api/filmes`
   - `PUT /api/filmes/:id`
   - `DELETE /api/filmes/:id`
3. [Salas](#3-salas)
   - `GET /api/salas`
   - `GET /api/salas/:id`
   - `POST /api/salas`
   - `PUT /api/salas/:id`
   - `DELETE /api/salas/:id`
4. [Sessões & Catálogo de Exibição](#4-sessões--catálogo-de-exibição)
   - `GET /api/sessoes` *(Catálogo público com joins)*
   - `GET /api/sessoes/:id`
   - `POST /api/sessoes`
   - `PUT /api/sessoes/:id`
   - `DELETE /api/sessoes/:id`
   - `PATCH /api/sessoes/:id/reservar`

---

## 1. Diagnóstico & Saúde

### `GET /api/health`
Verifica se o servidor e a API estão online e respondendo adequadamente.

#### Exemplo cURL:
```bash
curl -X GET http://localhost:3000/api/health
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "status": "ok",
  "timestamp": "2026-09-22T15:10:00.000Z"
}
```

---

## 2. Filmes

### `GET /api/filmes`
Retorna a lista completa de todos os filmes cadastrados, ordenados por título.

#### Exemplo cURL:
```bash
curl -X GET http://localhost:3000/api/filmes
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
      "titulo": "Divertida Mente 2",
      "sinopse": "Riley agora é uma adolescente e suas emoções originais...",
      "duracao": 96,
      "classificacao_indicativa": "Livre",
      "poster_url": "https://images.unsplash.com/...",
      "criado_em": "2026-09-22T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/filmes/:id`
Retorna os detalhes de um filme específico pelo seu identificador (UUID).

#### Parâmetros de URL:
- `id` *(string, obrigatório)*: UUID do filme.

#### Exemplo cURL:
```bash
curl -X GET http://localhost:3000/api/filmes/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
```

#### Respostas:
- **`200 OK`**: Retorna o objeto do filme em `data`.
- **`404 Not Found`**: Se o filme com o ID informado não existir.

---

### `POST /api/filmes`
Cadastra um novo filme no catálogo do cinema.

#### Cabeçalhos:
- `Content-Type: application/json`

#### Corpo da Requisição (JSON Payload):
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `titulo` | String | **Sim** | Nome oficial do filme |
| `sinopse` | String | Não | Breve resumo da trama |
| `duracao` | Integer | **Sim** | Duração em minutos (número positivo) |
| `classificacao_indicativa` | String | Não | Ex: `'Livre'`, `'10 anos'`, `'12 anos'`, `'14 anos'`, `'16 anos'`, `'18 anos'` (Padrão: `'Livre'`) |
| `poster_url` | String | Não | URL pública para a imagem do pôster |

#### Exemplo de Payload:
```json
{
  "titulo": "Interestelar 2: Além do Horizonte",
  "sinopse": "Uma nova expedição científica busca compreender os limites da dobra espacial.",
  "duracao": 150,
  "classificacao_indicativa": "12 anos",
  "poster_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86"
}
```

#### Exemplo cURL:
```bash
curl -X POST http://localhost:3000/api/filmes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Interestelar 2: Além do Horizonte",
    "sinopse": "Uma nova expedição científica busca compreender os limites da dobra espacial.",
    "duracao": 150,
    "classificacao_indicativa": "12 anos"
  }'
```

#### Respostas:
- **`201 Created`**: Filme cadastrado com sucesso.
- **`400 Bad Request`**: Dados ausentes ou formato inválido.

---

### `PUT /api/filmes/:id`
Atualiza dados de um filme existente.

#### Exemplo cURL:
```bash
curl -X PUT http://localhost:3000/api/filmes/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d \
  -H "Content-Type: application/json" \
  -d '{
    "duracao": 172
  }'
```

---

### `DELETE /api/filmes/:id`
Exclui um filme e remove em cascata todas as suas sessões vinculadas.

#### Exemplo cURL:
```bash
curl -X DELETE http://localhost:3000/api/filmes/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "message": "Filme \"Interestelar\" e suas sessões associadas foram excluídos com sucesso."
}
```

---

## 3. Salas

### `GET /api/salas`
Lista todas as salas de exibição cadastradas e suas respectivas capacidades máximas.

#### Exemplo cURL:
```bash
curl -X GET http://localhost:3000/api/salas
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "nome": "Sala 1 - IMAX Laser 4K",
      "capacidade_assentos": 120,
      "criado_em": "2026-09-22T12:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/salas`
Cadastra uma nova sala física.

#### Corpo da Requisição (JSON Payload):
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `nome` | String | **Sim** | Identificação ou número da sala |
| `capacidade_assentos` | Integer | **Sim** | Limite total de assentos (inteiro positivo) |

#### Exemplo cURL:
```bash
curl -X POST http://localhost:3000/api/salas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Sala 4 - ScreenX 270",
    "capacidade_assentos": 70
  }'
```

#### Resposta de Sucesso (`201 Created`):
```json
{
  "success": true,
  "message": "Sala criada com sucesso!",
  "data": {
    "id": "44444444-4444-4444-4444-444444444444",
    "nome": "Sala 4 - ScreenX 270",
    "capacidade_assentos": 70,
    "criado_em": "2026-09-22T15:00:00.000Z"
  }
}
```

---

### `PUT /api/salas/:id`
Atualiza informações da sala (ex: alteração de capacidade ou nome).

#### Exemplo cURL:
```bash
curl -X PUT http://localhost:3000/api/salas/11111111-1111-1111-1111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{
    "capacidade_assentos": 130
  }'
```

---

### `DELETE /api/salas/:id`
Exclui uma sala e suas sessões associadas.

#### Exemplo cURL:
```bash
curl -X DELETE http://localhost:3000/api/salas/11111111-1111-1111-1111-111111111111
```

---

## 4. Sessões & Catálogo de Exibição

### `GET /api/sessoes` *(Catálogo Público com Joins)*
Retorna o catálogo de sessões programadas, unindo automaticamente as informações completas do filme e da sala correspondente. Inclui cálculos em tempo real de ocupação e assentos disponíveis.

#### Parâmetros de Consulta (Query Params - Opcionais):
- `data`: Filtrar por dia específico de exibição (formato `AAAA-MM-DD`, ex: `2026-09-22`).
- `filme_id`: Filtrar sessões de um filme específico (UUID).
- `sala_id`: Filtrar sessões de uma sala específica (UUID).

#### Exemplo cURL:
```bash
curl -X GET "http://localhost:3000/api/sessoes?data=2026-09-22"
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "aaaaaaa1-1111-1111-1111-111111111111",
      "filme_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "sala_id": "11111111-1111-1111-1111-111111111111",
      "data_exibicao": "2026-09-22",
      "horario_inicio": "14:30:00",
      "horario_termino": "17:20:00",
      "assentos_disponiveis": 98,
      "preco": 38.00,
      "filmes": {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "titulo": "Interestelar",
        "duracao": 169,
        "classificacao_indicativa": "10 anos",
        "poster_url": "https://images.unsplash.com/..."
      },
      "salas": {
        "id": "11111111-1111-1111-1111-111111111111",
        "nome": "Sala 1 - IMAX Laser 4K",
        "capacidade_assentos": 120
      },
      "capacidade_total": 120,
      "assentos_ocupados": 22,
      "percentual_ocupacao": 18,
      "esgotado": false
    }
  ]
}
```

---

### `GET /api/sessoes/:id`
Busca os detalhes completos de uma sessão pelo ID.

#### Exemplo cURL:
```bash
curl -X GET http://localhost:3000/api/sessoes/aaaaaaa1-1111-1111-1111-111111111111
```

---

### `POST /api/sessoes`
Programa uma nova sessão. Se o campo `assentos_disponiveis` for omitido, o sistema assume automaticamente a capacidade máxima da sala indicada.

#### Corpo da Requisição (JSON Payload):
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `filme_id` | UUID | **Sim** | ID do filme a ser exibido |
| `sala_id` | UUID | **Sim** | ID da sala onde ocorrerá a sessão |
| `data_exibicao` | Date (`AAAA-MM-DD`) | **Sim** | Dia da sessão |
| `horario_inicio` | Time (`HH:MM:SS`) | **Sim** | Horário de início |
| `horario_termino` | Time (`HH:MM:SS`) | **Sim** | Horário previsto de término |
| `assentos_disponiveis` | Integer | Não | Vagas iniciais (Padrão: limite da sala) |
| `preco` | Number | Não | Valor do ingresso em R$ (Padrão: `32.00`) |

#### Exemplo cURL:
```bash
curl -X POST http://localhost:3000/api/sessoes \
  -H "Content-Type: application/json" \
  -d '{
    "filme_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "sala_id": "11111111-1111-1111-1111-111111111111",
    "data_exibicao": "2026-09-23",
    "horario_inicio": "21:15:00",
    "horario_termino": "23:55:00",
    "preco": 42.00
  }'
```

#### Respostas:
- **`201 Created`**: Sessão cadastrada e assentos alocados.
- **`400 Bad Request`**: Dados inválidos ou assentos excedendo a capacidade da sala.
- **`404 Not Found`**: Caso o `filme_id` ou `sala_id` informados não existam.

---

### `PUT /api/sessoes/:id`
Altera horário, data, sala ou assentos disponíveis de uma sessão.

#### Exemplo cURL:
```bash
curl -X PUT http://localhost:3000/api/sessoes/aaaaaaa1-1111-1111-1111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{
    "horario_inicio": "15:00:00",
    "horario_termino": "17:50:00"
  }'
```

---

### `PATCH /api/sessoes/:id/reservar`
Endpoint funcional para reserva imediata de ingressos (utilizado pelo frontend para diminuir o estoque de assentos).

#### Corpo da Requisição:
```json
{
  "quantidade": 2
}
```

#### Exemplo cURL:
```bash
curl -X PATCH http://localhost:3000/api/sessoes/aaaaaaa1-1111-1111-1111-111111111111/reservar \
  -H "Content-Type: application/json" \
  -d '{ "quantidade": 1 }'
```

#### Respostas:
- **`200 OK`**: Ingresso(s) reservado(s) e vagas atualizadas.
- **`400 Bad Request`**: Quantidade excede assentos disponíveis.
- **`404 Not Found`**: Sessão não encontrada.

---

### `DELETE /api/sessoes/:id`
Cancela ou exclui uma sessão específica.

#### Exemplo cURL:
```bash
curl -X DELETE http://localhost:3000/api/sessoes/aaaaaaa1-1111-1111-1111-111111111111
```
