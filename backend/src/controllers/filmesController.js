const supabase = require('../config/supabase');

// GET /api/filmes - Listar todos os filmes
const listarFilmes = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('filmes')
      .select('*')
      .order('titulo', { ascending: true });

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

// GET /api/filmes/:id - Obter um filme por ID
const obterFilmePorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('filmes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: `Filme com ID ${id} não encontrado.`
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

// POST /api/filmes - Criar novo filme
const criarFilme = async (req, res, next) => {
  try {
    const { titulo, sinopse, duracao, classificacao_indicativa, poster_url } = req.body;

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O campo "titulo" é obrigatório e deve ser um texto válido.'
      });
    }

    if (!duracao || isNaN(duracao) || Number(duracao) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O campo "duracao" é obrigatório e deve ser um número inteiro positivo (em minutos).'
      });
    }

    const novoFilme = {
      titulo: titulo.trim(),
      sinopse: sinopse ? sinopse.trim() : '',
      duracao: parseInt(duracao, 10),
      classificacao_indicativa: classificacao_indicativa ? classificacao_indicativa.trim() : 'Livre',
      poster_url: poster_url ? poster_url.trim() : null
    };

    const { data, error } = await supabase
      .from('filmes')
      .insert([novoFilme])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Filme cadastrado com sucesso!',
      data: Array.isArray(data) ? data[0] : data
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/filmes/:id - Atualizar filme existente
const atualizarFilme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, sinopse, duracao, classificacao_indicativa, poster_url } = req.body;

    // Verificar se filme existe
    const { data: existente } = await supabase
      .from('filmes')
      .select('*')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Filme com ID ${id} não encontrado para atualização.`
      });
    }

    const dadosAtualizacao = {};
    if (titulo !== undefined) dadosAtualizacao.titulo = titulo.trim();
    if (sinopse !== undefined) dadosAtualizacao.sinopse = sinopse.trim();
    if (duracao !== undefined) {
      if (isNaN(duracao) || Number(duracao) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'O campo "duracao" deve ser um número positivo.'
        });
      }
      dadosAtualizacao.duracao = parseInt(duracao, 10);
    }
    if (classificacao_indicativa !== undefined) {
      dadosAtualizacao.classificacao_indicativa = classificacao_indicativa.trim();
    }
    if (poster_url !== undefined) {
      dadosAtualizacao.poster_url = poster_url.trim();
    }

    const { data, error } = await supabase
      .from('filmes')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Filme atualizado com sucesso!',
      data: Array.isArray(data) ? data[0] : (data || { ...existente, ...dadosAtualizacao })
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/filmes/:id - Excluir filme
const deletarFilme = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existente } = await supabase
      .from('filmes')
      .select('*')
      .eq('id', id)
      .single();

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: `Filme com ID ${id} não encontrado para exclusão.`
      });
    }

    const { error } = await supabase
      .from('filmes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Filme "${existente.titulo}" e suas sessões associadas foram excluídos com sucesso.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarFilmes,
  obterFilmePorId,
  criarFilme,
  atualizarFilme,
  deletarFilme
};
