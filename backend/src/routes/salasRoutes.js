const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salasController');

// Rotas para Gerenciamento de Salas
router.get('/', salasController.listarSalas);
router.get('/:id', salasController.obterSalaPorId);
router.post('/', salasController.criarSala);
router.put('/:id', salasController.atualizarSala);
router.delete('/:id', salasController.deletarSala);

module.exports = router;
