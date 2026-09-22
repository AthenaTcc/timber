const express = require('express');
const router = express.Router();
const filmesController = require('../controllers/filmesController');

// Rotas para Gerenciamento de Filmes
router.get('/', filmesController.listarFilmes);
router.get('/:id', filmesController.obterFilmePorId);
router.post('/', filmesController.criarFilme);
router.put('/:id', filmesController.atualizarFilme);
router.delete('/:id', filmesController.deletarFilme);

module.exports = router;
