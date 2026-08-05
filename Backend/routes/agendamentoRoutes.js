const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const upload = require('../middlewares/upload');

router.get('/', agendamentoController.listarTodos);

// upload.single('arquivoNF') precisa ter exatamente o mesmo nome que você enviou no FormData do frontend
router.post('/', upload.single('arquivoNF'), agendamentoController.criar);
router.put('/:protocolo', upload.single('arquivoNF'), agendamentoController.atualizar);
router.patch('/:protocolo/status', agendamentoController.atualizarStatus);

module.exports = router;