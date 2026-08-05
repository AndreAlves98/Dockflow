const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

// Torna a pasta "uploads" pública, para que os URLs dos PDFs funcionem no frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/agendamentos', agendamentoRoutes);

const PORT = process.env.PORT || 8080;

// Sincroniza os modelos com o banco (Cria as tabelas dinamicamente)
sequelize.sync({ alter: true }) // O 'alter: true' verifica diferenças e atualiza as colunas sem dropar a tabela
    .then(() => {
        console.log('Tabelas sincronizadas no PostgreSQL.');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar ou sincronizar o banco:', err);
    });