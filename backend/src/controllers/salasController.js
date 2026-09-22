const supabase = require('../config/supabase');

// GET /api/salas - Listar todas as salas
const listarSalas = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data ? data.length : 0,
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/salas/:id - Obter sala por ID
const obterSalaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: `Sala com ID ${id} não encontrada.`
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/salas - Criar nova sala
const criarSala = async (req, res, next) => {
  try {
    const { nome, capacidade_assentos } = req.body;

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O campo "nome" da sala é obrigatório.'
      });
    }

    if (!capacidade_assentos || isNaN(capacidade_assentos) || Number(capacidade_assentos) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O campo "capacidade_assentos" é obrigatório e deve ser um número positivo.'
      });
    }

    const novaSala = {
      nome: nome.trim(),
      capacidade_assentos: parseInt(capacidade_assentos, 10)
    };

    const { data, error } = await supabase
      .from('salas')
      .insert([novaSala])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Sala criada com sucesso!',
      data: Array.isArray(data) ? data[0] : data
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/salas/:id - Atualizar sala
const atualizarSala = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, capacidade_assentos } = req.body;

    const { data: existente } = await supabase
      .from('salas')
      .select('*')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Sala com ID ${id} não encontrada para atualização.`
      });
    }

    const dadosAtualizacao = {};
    if (nome !== undefined) dadosAtualizacao.nome = nome.trim();
    if (capacidade_assentos !== undefined) {
      if (isNaN(capacidade_assentos) || Number(capacidade_assentos) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'O campo "capacidade_assentos" deve ser um número positivo.'
        });
      }
      dadosAtualizacao.capacidade_assentos = parseInt(capacidade_assentos, 10);
    }

    const { data, error } = await supabase
      .from('salas')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Sala atualizada com sucesso!',
      data: Array.isArray(data) ? data[0] : (data || { ...existente, ...dadosAtualizacao })
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/salas/:id - Excluir sala
const deletarSala = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existente } = await supabase
      .from('salas')
      .select('*')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Sala com ID ${id} não encontrada para exclusão.`
      });
    }

    const { error } = await supabase
      .from('salas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Sala "${existente.nome}" e suas sessões associadas foram excluídas com sucesso.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarSalas,
  obterSalaPorId,
  criarSala,
  atualizarSala,
  deletarSala
};
