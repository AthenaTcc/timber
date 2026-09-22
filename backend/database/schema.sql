-- ==============================================================================
-- MINI SISTEMA DE GERENCIAMENTO DE CINEMA
-- Script DDL: Criação das tabelas no Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Filmes
CREATE TABLE IF NOT EXISTS public.filmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    sinopse TEXT,
    duracao INTEGER NOT NULL CHECK (duracao > 0), -- Duração em minutos
    classificacao_indicativa VARCHAR(20) NOT NULL DEFAULT 'Livre', -- Ex: Livre, 10, 12, 14, 16, 18
    poster_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentários na tabela de Filmes
COMMENT ON TABLE public.filmes IS 'Catálogo de filmes em cartaz e cadastrados no cinema';
COMMENT ON COLUMN public.filmes.duracao IS 'Duração do filme expressa em minutos';

-- 3. Tabela de Salas
CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE, -- Ex: Sala 1 - IMAX, Sala 2 - VIP
    capacidade_assentos INTEGER NOT NULL CHECK (capacidade_assentos > 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentários na tabela de Salas
COMMENT ON TABLE public.salas IS 'Salas físicas do cinema e sua capacidade máxima de assentos';

-- 4. Tabela de Sessões (Exibição)
CREATE TABLE IF NOT EXISTS public.sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filme_id UUID NOT NULL REFERENCES public.filmes(id) ON DELETE CASCADE,
    sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE CASCADE,
    data_exibicao DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_termino TIME NOT NULL,
    assentos_disponiveis INTEGER NOT NULL CHECK (assentos_disponiveis >= 0),
    preco NUMERIC(10, 2) DEFAULT 32.00,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_horario_valido CHECK (horario_termino > horario_inicio)
);

-- Comentários na tabela de Sessões
COMMENT ON TABLE public.sessoes IS 'Sessões programadas vinculando filme, sala, horário e assentos disponíveis';

-- 5. Índices para otimização de consultas e joins relacionais
CREATE INDEX IF NOT EXISTS idx_sessoes_filme_id ON public.sessoes(filme_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_sala_id ON public.sessoes(sala_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_exibicao ON public.sessoes(data_exibicao);
CREATE INDEX IF NOT EXISTS idx_filmes_titulo ON public.filmes(titulo);

-- 6. Configuração de Row Level Security (RLS) no Supabase
ALTER TABLE public.filmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para consumo e testes via API
DROP POLICY IF EXISTS "Acesso total publico a filmes" ON public.filmes;
CREATE POLICY "Acesso total publico a filmes"
    ON public.filmes
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico a salas" ON public.salas;
CREATE POLICY "Acesso total publico a salas"
    ON public.salas
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico a sessoes" ON public.sessoes;
CREATE POLICY "Acesso total publico a sessoes"
    ON public.sessoes
    FOR ALL
    USING (true)
    WITH CHECK (true);
