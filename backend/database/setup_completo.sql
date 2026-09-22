-- ==============================================================================
-- CINETIMBER - SETUP COMPLETO DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/bnoymsbuezdblvjpgnsp/sql/new
-- ==============================================================================

-- 1. Habilitar extensão pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Filmes
CREATE TABLE IF NOT EXISTS public.filmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    sinopse TEXT,
    duracao INTEGER NOT NULL CHECK (duracao > 0),
    classificacao_indicativa VARCHAR(20) NOT NULL DEFAULT 'Livre',
    poster_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Salas
CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    capacidade_assentos INTEGER NOT NULL CHECK (capacidade_assentos > 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Sessões (Exibições)
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

-- 5. Índices para performance em buscas e joins
CREATE INDEX IF NOT EXISTS idx_sessoes_filme_id ON public.sessoes(filme_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_sala_id ON public.sessoes(sala_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_exibicao ON public.sessoes(data_exibicao);
CREATE INDEX IF NOT EXISTS idx_filmes_titulo ON public.filmes(titulo);

-- 6. Habilitar Row Level Security (RLS) e Políticas de Acesso
ALTER TABLE public.filmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total publico a filmes" ON public.filmes;
CREATE POLICY "Acesso total publico a filmes" ON public.filmes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico a salas" ON public.salas;
CREATE POLICY "Acesso total publico a salas" ON public.salas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico a sessoes" ON public.sessoes;
CREATE POLICY "Acesso total publico a sessoes" ON public.sessoes FOR ALL USING (true) WITH CHECK (true);

-- 7. Dados Iniciais (Seed)
INSERT INTO public.filmes (id, titulo, sinopse, duracao, classificacao_indicativa, poster_url)
VALUES 
    (
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        'Interestelar',
        'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial.',
        169,
        '10 anos',
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80'
    ),
    (
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
        'Duna: Parte 2',
        'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
        166,
        '14 anos',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
    ),
    (
        'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
        'Divertida Mente 2',
        'Riley agora é uma adolescente e suas emoções originais precisam lidar com a chegada inesperada de novos sentimentos no quartel-general.',
        96,
        'Livre',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80'
    ),
    (
        'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
        'Oppenheimer',
        'A história do físico americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e o desenvolvimento da bomba atômica.',
        180,
        '16 anos',
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.salas (id, nome, capacidade_assentos)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Sala 1 - IMAX Laser 4K', 120),
    ('22222222-2222-2222-2222-222222222222', 'Sala 2 - VIP Prime Reclinável', 48),
    ('33333333-3333-3333-3333-333333333333', 'Sala 3 - Dolby Atmos 3D', 85)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sessoes (id, filme_id, sala_id, data_exibicao, horario_inicio, horario_termino, assentos_disponiveis, preco)
VALUES 
    (
        'aaaaaaa1-1111-1111-1111-111111111111',
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE,
        '14:30:00',
        '17:20:00',
        98,
        38.00
    ),
    (
        'aaaaaaa2-2222-2222-2222-222222222222',
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE,
        '18:00:00',
        '20:50:00',
        42,
        42.00
    ),
    (
        'bbbbbbb1-1111-1111-1111-111111111111',
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '16:00:00',
        '18:46:00',
        18,
        55.00
    ),
    (
        'ccccccc1-1111-1111-1111-111111111111',
        'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
        '33333333-3333-3333-3333-333333333333',
        CURRENT_DATE,
        '13:30:00',
        '15:06:00',
        75,
        34.00
    )
ON CONFLICT (id) DO NOTHING;
