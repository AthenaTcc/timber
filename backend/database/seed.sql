-- ==============================================================================
-- MINI SISTEMA DE GERENCIAMENTO DE CINEMA
-- Script de Carga Inicial (Seed Data) para o Supabase
-- ==============================================================================

-- 1. Inserção de Filmes
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

-- 2. Inserção de Salas
INSERT INTO public.salas (id, nome, capacidade_assentos)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Sala 1 - IMAX Laser 4K',
        120
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Sala 2 - VIP Prime Reclinável',
        48
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Sala 3 - Dolby Atmos 3D',
        85
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Inserção de Sessões Programadas
INSERT INTO public.sessoes (id, filme_id, sala_id, data_exibicao, horario_inicio, horario_termino, assentos_disponiveis, preco)
VALUES 
    (
        'aaaaaaa1-1111-1111-1111-111111111111',
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- Interestelar
        '11111111-1111-1111-1111-111111111111', -- IMAX
        CURRENT_DATE,
        '14:30:00',
        '17:20:00',
        98,
        38.00
    ),
    (
        'aaaaaaa2-2222-2222-2222-222222222222',
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- Interestelar
        '11111111-1111-1111-1111-111111111111', -- IMAX
        CURRENT_DATE,
        '18:00:00',
        '20:50:00',
        42,
        42.00
    ),
    (
        'bbbbbbb1-1111-1111-1111-111111111111',
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', -- Duna: Parte 2
        '22222222-2222-2222-2222-222222222222', -- VIP Prime
        CURRENT_DATE,
        '16:00:00',
        '18:46:00',
        18,
        55.00
    ),
    (
        'bbbbbbb2-2222-2222-2222-222222222222',
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', -- Duna: Parte 2
        '22222222-2222-2222-2222-222222222222', -- VIP Prime
        CURRENT_DATE + INTERVAL '1 day',
        '20:00:00',
        '22:46:00',
        30,
        55.00
    ),
    (
        'ccccccc1-1111-1111-1111-111111111111',
        'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', -- Divertida Mente 2
        '33333333-3333-3333-3333-333333333333', -- Dolby Atmos 3D
        CURRENT_DATE,
        '13:30:00',
        '15:06:00',
        75,
        34.00
    ),
    (
        'ddddddd1-1111-1111-1111-111111111111',
        'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', -- Oppenheimer
        '11111111-1111-1111-1111-111111111111', -- IMAX
        CURRENT_DATE + INTERVAL '1 day',
        '19:30:00',
        '22:30:00',
        110,
        42.00
    )
ON CONFLICT (id) DO NOTHING;
