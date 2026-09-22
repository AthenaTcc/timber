const express = require('express');
const router = express.Router();
const sessoesController = require('../controllers/sessoesController');

// Rotas para Gerenciamento e Catálogo de Sessões
router.get('/', sessoesController.listarSessoes);
router.get('/:id', sessoesController.obterSessaoPorId);
router.post('/', sessoesController.criarSessao);
router.put('/:id', sessoesController.atualizarSessao);
router.delete('/:id', sessoesController.deletarSessao);
router.patch('/:id/reservar', sessoesController.reservarAssentos);

module.exports = router;
