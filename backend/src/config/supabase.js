const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseKey.includes('your-supabase-');

let realClient = null;

if (isConfigured) {
  try {
    realClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Cliente Supabase inicializado com credenciais para:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Falha ao inicializar cliente oficial do Supabase:', err.message);
  }
} else {
  console.log('ℹ️ Credenciais do Supabase ausentes ou com valor padrão. Usando modo simulado.');
}

// ---------------------------------------------------------------------------
// Repositório em memória com dados iniciais (Seed Data)
// ---------------------------------------------------------------------------
const store = {
  filmes: [
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      titulo: 'Interestelar',
      sinopse: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial.',
      duracao: 169,
      classificacao_indicativa: '10 anos',
      poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
      criado_em: new Date().toISOString()
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      titulo: 'Duna: Parte 2',
      sinopse: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
      duracao: 166,
      classificacao_indicativa: '14 anos',
      poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      criado_em: new Date().toISOString()
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      titulo: 'Divertida Mente 2',
      sinopse: 'Riley agora é uma adolescente e suas emoções originais precisam lidar com a chegada inesperada de novos sentimentos no quartel-general.',
      duracao: 96,
      classificacao_indicativa: 'Livre',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      criado_em: new Date().toISOString()
    },
    {
      id: 'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
      titulo: 'Oppenheimer',
      sinopse: 'A história do físico americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e o desenvolvimento da bomba atômica.',
      duracao: 180,
      classificacao_indicativa: '16 anos',
      poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
      criado_em: new Date().toISOString()
    }
  ],
  salas: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      nome: 'Sala 1 - IMAX Laser 4K',
      capacidade_assentos: 120,
      criado_em: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      nome: 'Sala 2 - VIP Prime Reclinável',
      capacidade_assentos: 48,
      criado_em: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      nome: 'Sala 3 - Dolby Atmos 3D',
      capacidade_assentos: 85,
      criado_em: new Date().toISOString()
    }
  ],
  sessoes: [
    {
      id: 'aaaaaaa1-1111-1111-1111-111111111111',
      filme_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      sala_id: '11111111-1111-1111-1111-111111111111',
      data_exibicao: new Date().toISOString().split('T')[0],
      horario_inicio: '14:30:00',
      horario_termino: '17:20:00',
      assentos_disponiveis: 98,
      preco: 38.00,
      criado_em: new Date().toISOString()
    },
    {
      id: 'aaaaaaa2-2222-2222-2222-222222222222',
      filme_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      sala_id: '11111111-1111-1111-1111-111111111111',
      data_exibicao: new Date().toISOString().split('T')[0],
      horario_inicio: '18:00:00',
      horario_termino: '20:50:00',
      assentos_disponiveis: 42,
      preco: 42.00,
      criado_em: new Date().toISOString()
    },
    {
      id: 'bbbbbbb1-1111-1111-1111-111111111111',
      filme_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      sala_id: '22222222-2222-2222-2222-222222222222',
      data_exibicao: new Date().toISOString().split('T')[0],
      horario_inicio: '16:00:00',
      horario_termino: '18:46:00',
      assentos_disponiveis: 18,
      preco: 55.00,
      criado_em: new Date().toISOString()
    },
    {
      id: 'ccccccc1-1111-1111-1111-111111111111',
      filme_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      sala_id: '33333333-3333-3333-3333-333333333333',
      data_exibicao: new Date().toISOString().split('T')[0],
      horario_inicio: '13:30:00',
      horario_termino: '15:06:00',
      assentos_disponiveis: 75,
      preco: 34.00,
      criado_em: new Date().toISOString()
    }
  ]
};

// Builder para operações em memória
const createMockQueryBuilder = (tableName) => {
  let operation = 'select';
  let selectFields = '*';
  let filters = [];
  let insertData = null;
  let updateData = null;
  let isSingle = false;
  let orderParams = null;

  const builder = {
    select: (fields = '*') => {
      selectFields = fields;
      return builder;
    },
    insert: (data) => {
      operation = 'insert';
      insertData = Array.isArray(data) ? data : [data];
      return builder;
    },
    update: (data) => {
      operation = 'update';
      updateData = data;
      return builder;
    },
    delete: () => {
      operation = 'delete';
      return builder;
    },
    eq: (column, val) => {
      filters.push((item) => String(item[column]) === String(val));
      return builder;
    },
    order: (column, { ascending = true } = {}) => {
      orderParams = { column, ascending };
      return builder;
    },
    single: () => {
      isSingle = true;
      return builder;
    },
    then: async (resolve) => {
      const table = store[tableName] || [];
      let resultData = null;
      let resultError = null;

      try {
        if (operation === 'select') {
          let filtered = table.filter(item => filters.every(f => f(item)));

          // Trata joins de sessoes (filmes, salas)
          if (tableName === 'sessoes' && selectFields.includes('filmes') && selectFields.includes('salas')) {
            filtered = filtered.map(s => {
              const filme = store.filmes.find(f => f.id === s.filme_id) || null;
              const sala = store.salas.find(r => r.id === s.sala_id) || null;
              return {
                ...s,
                filmes: filme,
                salas: sala
              };
            });
          }

          if (orderParams) {
            const { column, ascending } = orderParams;
            filtered.sort((a, b) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
          }

          if (isSingle) {
            resultData = filtered.length > 0 ? { ...filtered[0] } : null;
            if (!resultData) {
              resultError = { message: 'Row not found', code: 'PGRST116' };
            }
          } else {
            resultData = filtered.map(item => ({ ...item }));
          }
        } else if (operation === 'insert') {
          const crypto = require('crypto');
          const inserted = insertData.map(item => {
            const newItem = {
              id: item.id || crypto.randomUUID(),
              criado_em: new Date().toISOString(),
              ...item
            };
            table.push(newItem);
            return newItem;
          });
          resultData = isSingle ? inserted[0] : inserted;
        } else if (operation === 'update') {
          const updated = [];
          table.forEach((item, index) => {
            if (filters.every(f => f(item))) {
              store[tableName][index] = { ...item, ...updateData };
              updated.push(store[tableName][index]);
            }
          });
          resultData = isSingle ? (updated[0] || null) : updated;
        } else if (operation === 'delete') {
          const initialLength = store[tableName].length;
          store[tableName] = table.filter(item => !filters.every(f => f(item)));
          resultData = { deletedCount: initialLength - store[tableName].length };
        }
      } catch (err) {
        resultError = { message: err.message };
      }

      return resolve({ data: resultData, error: resultError });
    }
  };

  return builder;
};

let avisouTabelaInexistente = false;

// Proxy inteligente para delegar ao Supabase Real com fallback automático caso as tabelas ainda não existam
const supabase = {
  from: (tableName) => {
    if (!realClient) {
      return createMockQueryBuilder(tableName);
    }

    // Se temos o cliente real configurado, criamos um builder híbrido
    let query = realClient.from(tableName);
    const mockBuilder = createMockQueryBuilder(tableName);

    const hybridBuilder = {
      select: (...args) => {
        query = query.select(...args);
        mockBuilder.select(...args);
        return hybridBuilder;
      },
      insert: (...args) => {
        query = query.insert(...args);
        mockBuilder.insert(...args);
        return hybridBuilder;
      },
      update: (...args) => {
        query = query.update(...args);
        mockBuilder.update(...args);
        return hybridBuilder;
      },
      delete: (...args) => {
        query = query.delete(...args);
        mockBuilder.delete(...args);
        return hybridBuilder;
      },
      eq: (...args) => {
        query = query.eq(...args);
        mockBuilder.eq(...args);
        return hybridBuilder;
      },
      order: (...args) => {
        query = query.order(...args);
        mockBuilder.order(...args);
        return hybridBuilder;
      },
      single: (...args) => {
        query = query.single(...args);
        mockBuilder.single(...args);
        return hybridBuilder;
      },
      then: async (resolve, reject) => {
        try {
          const res = await query;
          // Se a tabela ainda não foi criada no Supabase (código PGRST205)
          if (res.error && res.error.code === 'PGRST205') {
            if (!avisouTabelaInexistente) {
              console.log('----------------------------------------------------');
              console.log('⚠️ [Supabase] Tabelas ainda não foram criadas no banco de dados!');
              console.log('👉 Execute o script backend/database/setup_completo.sql no SQL Editor do Supabase:');
              console.log('👉 https://supabase.com/dashboard/project/bnoymsbuezdblvjpgnsp/sql/new');
              console.log('ℹ️ O sistema responderá temporariamente com dados em memória.');
              console.log('----------------------------------------------------');
              avisouTabelaInexistente = true;
            }
            return mockBuilder.then(resolve);
          }
          return resolve(res);
        } catch (err) {
          return mockBuilder.then(resolve);
        }
      }
    };

    return hybridBuilder;
  },
  _isMock: !realClient,
  _store: store
};

module.exports = supabase;
