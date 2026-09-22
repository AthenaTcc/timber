const supabase = require('../config/supabase');

// GET /api/sessoes - Listar sessões / Catálogo de exibição com filmes e salas
const listarSessoes = async (req, res, next) => {
  try {
    const { data: dataFiltro, filme_id, sala_id } = req.query;

    let query = supabase
      .from('sessoes')
      .select('*, filmes(*), salas(*)')
      .order('data_exibicao', { ascending: true })
      .order('horario_inicio', { ascending: true });

    if (dataFiltro) {
      query = query.eq('data_exibicao', dataFiltro);
    }
    if (filme_id) {
      query = query.eq('filme_id', filme_id);
    }
    if (sala_id) {
      query = query.eq('sala_id', sala_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enriquece os dados para o catálogo com métricas úteis
    const sessoesEnriquecidas = (data || []).map(sessao => {
      const capacidadeMaxima = sessao.salas ? sessao.salas.capacidade_assentos : 0;
      const assentosOcupados = Math.max(0, capacidadeMaxima - sessao.assentos_disponiveis);
      const percentualOcupacao = capacidadeMaxima > 0 
        ? Math.round((assentosOcupados / capacidadeMaxima) * 100) 
        : 0;

      return {
        ...sessao,
        capacidade_total: capacidadeMaxima,
        assentos_ocupados: assentosOcupados,
        percentual_ocupacao: percentualOcupacao,
        esgotado: sessao.assentos_disponiveis <= 0
      };
    });

    return res.status(200).json({
      success: true,
      count: sessoesEnriquecidas.length,
      data: sessoesEnriquecidas
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessoes/:id - Obter detalhes de uma sessão por ID
const obterSessaoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('sessoes')
      .select('*, filmes(*), salas(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: `Sessão com ID ${id} não encontrada.`
      });
    }

    const capacidadeMaxima = data.salas ? data.salas.capacidade_assentos : 0;
    const sessaoEnriquecida = {
      ...data,
      capacidade_total: capacidadeMaxima,
      assentos_ocupados: Math.max(0, capacidadeMaxima - data.assentos_disponiveis),
      esgotado: data.assentos_disponiveis <= 0
    };

    return res.status(200).json({
      success: true,
      data: sessaoEnriquecida
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/sessoes - Criar nova sessão
const criarSessao = async (req, res, next) => {
  try {
    const { 
      filme_id, 
      sala_id, 
      data_exibicao, 
      horario_inicio, 
      horario_termino, 
      assentos_disponiveis,
      preco 
    } = req.body;

    // Validações básicas de campos obrigatórios
    if (!filme_id) {
      return res.status(400).json({ success: false, message: 'O campo "filme_id" é obrigatório.' });
    }
    if (!sala_id) {
      return res.status(400).json({ success: false, message: 'O campo "sala_id" é obrigatório.' });
    }
    if (!data_exibicao) {
      return res.status(400).json({ success: false, message: 'O campo "data_exibicao" (AAAA-MM-DD) é obrigatório.' });
    }
    if (!horario_inicio || !horario_termino) {
      return res.status(400).json({ success: false, message: 'Os campos "horario_inicio" e "horario_termino" são obrigatórios.' });
    }

    // Verificar se o filme existe
    const { data: filme, error: erroFilme } = await supabase
      .from('filmes')
      .select('id, titulo')
      .eq('id', filme_id)
      .single();

    if (erroFilme || !filme) {
      return res.status(404).json({
        success: false,
        message: `Filme associado (ID ${filme_id}) não foi encontrado.`
      });
    }

    // Verificar se a sala existe
    const { data: sala, error: erroSala } = await supabase
      .from('salas')
      .select('id, nome, capacidade_assentos')
      .eq('id', sala_id)
      .single();

    if (erroSala || !sala) {
      return res.status(404).json({
        success: false,
        message: `Sala associada (ID ${sala_id}) não foi encontrada.`
      });
    }

    // Se assentos_disponíveis não for enviado, assume a capacidade total da sala
    let vagas = sala.capacidade_assentos;
    if (assentos_disponiveis !== undefined) {
      const vagasNum = Number(assentos_disponiveis);
      if (isNaN(vagasNum) || vagasNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'O campo "assentos_disponiveis" não pode ser negativo.'
        });
      }
      if (vagasNum > sala.capacidade_assentos) {
        return res.status(400).json({
          success: false,
          message: `O número de assentos disponíveis (${vagasNum}) não pode exceder a capacidade da sala (${sala.capacidade_assentos}).`
        });
      }
      vagas = vagasNum;
    }

    const novaSessao = {
      filme_id,
      sala_id,
      data_exibicao,
      horario_inicio,
      horario_termino,
      assentos_disponiveis: vagas,
      preco: preco !== undefined && !isNaN(Number(preco)) ? Number(preco) : 32.00
    };

    const { data, error } = await supabase
      .from('sessoes')
      .insert([novaSessao])
      .select('*, filmes(*), salas(*)')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Sessão cadastrada com sucesso!',
      data: Array.isArray(data) ? data[0] : data
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/sessoes/:id - Atualizar dados da sessão
const atualizarSessao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      filme_id, 
      sala_id, 
      data_exibicao, 
      horario_inicio, 
      horario_termino, 
      assentos_disponiveis,
      preco 
    } = req.body;

    const { data: existente } = await supabase
      .from('sessoes')
      .select('*, salas(*)')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Sessão com ID ${id} não encontrada para atualização.`
      });
    }

    const dadosAtualizacao = {};
    if (filme_id !== undefined) dadosAtualizacao.filme_id = filme_id;
    if (sala_id !== undefined) dadosAtualizacao.sala_id = sala_id;
    if (data_exibicao !== undefined) dadosAtualizacao.data_exibicao = data_exibicao;
    if (horario_inicio !== undefined) dadosAtualizacao.horario_inicio = horario_inicio;
    if (horario_termino !== undefined) dadosAtualizacao.horario_termino = horario_termino;
    if (preco !== undefined && !isNaN(Number(preco))) dadosAtualizacao.preco = Number(preco);

    if (assentos_disponiveis !== undefined) {
      const vagasNum = Number(assentos_disponiveis);
      const capSala = existente.salas ? existente.salas.capacidade_assentos : 9999;
      if (isNaN(vagasNum) || vagasNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'O campo "assentos_disponiveis" não pode ser negativo.'
        });
      }
      if (vagasNum > capSala) {
        return res.status(400).json({
          success: false,
          message: `Os assentos disponíveis (${vagasNum}) não podem ultrapassar a capacidade da sala (${capSala}).`
        });
      }
      dadosAtualizacao.assentos_disponiveis = vagasNum;
    }

    const { data, error } = await supabase
      .from('sessoes')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select('*, filmes(*), salas(*)')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Sessão atualizada com sucesso!',
      data: Array.isArray(data) ? data[0] : (data || { ...existente, ...dadosAtualizacao })
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sessoes/:id - Cancelar ou excluir sessão
const deletarSessao = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existente } = await supabase
      .from('sessoes')
      .select('*')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Sessão com ID ${id} não encontrada para exclusão.`
      });
    }

    const { error } = await supabase
      .from('sessoes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Sessão ${id} excluída com sucesso.`
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/sessoes/:id/reservar - Reservar assento (interatividade no frontend)
const reservarAssentos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quantidade = req.body && req.body.quantidade ? parseInt(req.body.quantidade, 10) : 1;

    if (isNaN(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A quantidade de assentos deve ser um número maior que zero.'
      });
    }

    const { data: sessao, error: erroBusca } = await supabase
      .from('sessoes')
      .select('*, filmes(*), salas(*)')
      .eq('id', id)
      .single();

    if (erroBusca || !sessao) {
      return res.status(404).json({
        success: false,
        message: `Sessão com ID ${id} não encontrada.`
      });
    }

    if (sessao.assentos_disponiveis < quantidade) {
      return res.status(400).json({
        success: false,
        message: `Não há assentos suficientes. Disponíveis: ${sessao.assentos_disponiveis}, Solicitados: ${quantidade}.`
      });
    }

    const novosAssentos = sessao.assentos_disponiveis - quantidade;

    const { data: atualizada, error: erroAtualizacao } = await supabase
      .from('sessoes')
      .update({ assentos_disponiveis: novosAssentos })
      .eq('id', id)
      .select('*, filmes(*), salas(*)')
      .single();

    if (erroAtualizacao) throw erroAtualizacao;

    return res.status(200).json({
      success: true,
      message: `${quantidade} ingresso(s) reservado(s) com sucesso!`,
      data: Array.isArray(atualizada) ? atualizada[0] : (atualizada || { ...sessao, assentos_disponiveis: novosAssentos })
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarSessoes,
  obterSessaoPorId,
  criarSessao,
  atualizarSessao,
  deletarSessao,
  reservarAssentos
};
