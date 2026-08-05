const Agendamento = require('../models/Agendamento');
const { v4: uuidv4 } = require('uuid'); // Recomendável instalar: npm install uuid

class AgendamentoController {
    
    async listarTodos(req, res) {
        try {
            const agendamentos = await Agendamento.findAll({ order: [['createdAt', 'DESC']] });
            res.json(agendamentos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar dados' });
        }
    }

    async criar(req, res) {
        try {
            const dados = req.body;
            
            // Lógica para gerar um protocolo (Ex: 202605-XYZ)
            const protocoloGerado = `AG-${Date.now().toString().slice(-6)}`;
            
            // Se o Multer processou um arquivo, salva o caminho no banco
            let caminhoArquivo = null;
            if (req.file) {
                // A URL que o frontend vai usar para baixar o arquivo
                caminhoArquivo = `http://localhost:8080/uploads/${req.file.filename}`;
            }

            const novoAgendamento = await Agendamento.create({
                ...dados,
                protocolo: protocoloGerado,
                arquivoNF: caminhoArquivo
            });

            res.status(201).json(novoAgendamento);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Erro ao criar agendamento' });
        }
    }

    async atualizar(req, res) {
        try {
            const { protocolo } = req.params;
            const dados = req.body;

            const agendamento = await Agendamento.findByPk(protocolo);
            if (!agendamento) return res.status(404).json({ error: 'Não encontrado' });

            // Atualiza o arquivo só se um novo tiver sido enviado na edição
            if (req.file) {
                dados.arquivoNF = `http://localhost:8080/uploads/${req.file.filename}`;
            }

            await agendamento.update(dados);
            res.json(agendamento);
        } catch (error) {
            res.status(400).json({ error: 'Erro ao atualizar' });
        }
    }

    async atualizarStatus(req, res) {
        try {
            const { protocolo } = req.params;
            const { status, motivoCancelamento, obsCancelamento } = req.body;

            const agendamento = await Agendamento.findByPk(protocolo);
            if (!agendamento) return res.status(404).json({ error: 'Não encontrado' });

            await agendamento.update({ status, motivoCancelamento, obsCancelamento });
            res.json(agendamento);
        } catch (error) {
            res.status(400).json({ error: 'Erro ao atualizar status' });
        }
    }
}

module.exports = new AgendamentoController();