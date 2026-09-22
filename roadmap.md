# 🗺️ Roadmap do Projeto - Mini Sistema de Gerenciamento de Cinema

Este documento registra todas as etapas de desenvolvimento do sistema de gerenciamento de cinema, detalhando o progresso atualizado de cada fase.

---

## 📌 Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Documentação Inicial e Setup do Projeto | 🟢 Concluído |
| **Fase 2** | Modelagem e Banco de Dados (Supabase / PostgreSQL) | 🟢 Concluído |
| **Fase 3** | Desenvolvimento da API REST (Node.js + Express) | 🟢 Concluído |
| **Fase 4** | Frontend - Dashboard de Exibição (HTML, CSS, Vanilla JS) | 🟢 Concluído |
| **Fase 5** | Testes de Integração e Documentação Final | 🟢 Concluído |

---

## 📋 Detalhamento das Tarefas

### Fase 1: Documentação Inicial e Setup
- [x] Confirmação de escopo e alinhamento de requisitos
- [x] Criação do arquivo `roadmap.md`
- [x] Criação do arquivo `contexto.md`
- [x] Criação da estrutura de diretórios (`backend/`, `frontend/`)
- [x] Inicialização do `package.json` no backend com dependências (`express`, `@supabase/supabase-js`, `cors`, `dotenv`)
- [x] Configuração inicial de ambiente (`.env.example` e `.env`)

### Fase 2: Banco de Dados (Supabase)
- [x] Criação do script DDL `backend/database/schema.sql` com tabelas `filmes`, `salas` e `sessoes`
- [x] Definição de chaves primárias (UUID), chaves estrangeiras com integridade referencial (`ON DELETE CASCADE`) e constraints
- [x] Configuração de políticas de segurança Row Level Security (RLS) para acesso via API
- [x] Criação do script de sementes (`backend/database/seed.sql`) com dados de teste realistas
- [x] Documentação de instruções para execução no SQL Editor do Supabase

### Fase 3: Desenvolvimento da API (Node.js)
- [x] Configuração do cliente Supabase (`src/config/supabase.js`) com resiliência e fallback
- [x] Criação dos controladores e rotas para Filmes (CRUD completo):
  - [x] `GET /api/filmes` - Listar todos os filmes
  - [x] `GET /api/filmes/:id` - Buscar filme por ID
  - [x] `POST /api/filmes` - Cadastrar novo filme
  - [x] `PUT /api/filmes/:id` - Atualizar filme
  - [x] `DELETE /api/filmes/:id` - Excluir filme
- [x] Criação dos controladores e rotas para Salas (CRUD completo):
  - [x] `GET /api/salas` - Listar todas as salas
  - [x] `GET /api/salas/:id` - Buscar sala por ID
  - [x] `POST /api/salas` - Cadastrar nova sala
  - [x] `PUT /api/salas/:id` - Atualizar sala
  - [x] `DELETE /api/salas/:id` - Excluir sala
- [x] Criação dos controladores e rotas para Sessões (CRUD e Catálogo):
  - [x] `GET /api/sessoes` - Catálogo público com dados unidos de filmes, salas e horários
  - [x] `GET /api/sessoes/:id` - Buscar sessão específica por ID
  - [x] `POST /api/sessoes` - Criar nova sessão vinculando filme, sala e calculando assentos
  - [x] `PUT /api/sessoes/:id` - Atualizar sessão
  - [x] `DELETE /api/sessoes/:id` - Cancelar/Excluir sessão
  - [x] `PATCH /api/sessoes/:id/reservar` - Reserva interativa de assentos
- [x] Configuração de CORS para permitir requisições do frontend
- [x] Configuração para Vercel Serverless Functions (`api/index.js` e `vercel.json`)
- [x] Configuração de servidor HTTP local para desenvolvimento (`src/server.js`)

### Fase 4: Frontend (Dashboard de Exibição)
- [x] Criação da página `frontend/index.html` com layout semântico e responsivo
- [x] Elaboração do design cinematográfico em `frontend/styles.css` (Dark theme, cards modernos, badges de classificação, barras de lotação)
- [x] Implementação de lógica Vanilla JS em `frontend/app.js`:
  - [x] Consumo assíncrono dos endpoints da API (`fetch`)
  - [x] Renderização dinâmica do catálogo de filmes agrupando suas respectivas sessões
  - [x] Filtro em tempo real por data e por título de filme
  - [x] Tratamento de estados visuais: Carregando (spinner), Erro e Lista Vazia
  - [x] Modal interativo para simulação de reserva de assento com atualização visual e toasts

### Fase 5: Testes e Documentação Final
- [x] Implementação de suíte de testes de integração automatizados (`backend/tests/api.test.js`)
- [x] Execução dos testes e validação de todos os códigos de status (200, 201, 400, 404) - 11 testes aprovados com 100% de sucesso
- [x] Criação da documentação completa em `API.md` com descrições, tabelas de parâmetros, payloads JSON e comandos cURL
- [x] Atualização final de `roadmap.md` e `contexto.md`
