const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agendamento = sequelize.define('Agendamento', {
    protocolo: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    transportadora: DataTypes.STRING,
    fornecedor: DataTypes.STRING,
    motorista: DataTypes.STRING,
    telefone: DataTypes.STRING,
    email: DataTypes.STRING,
    placaVeiculo: DataTypes.STRING,
    tipoVeiculo: DataTypes.STRING,
    data: DataTypes.STRING,
    horario: DataTypes.STRING,
    tipoCarga: DataTypes.STRING,
    peso: DataTypes.STRING,
    volume: DataTypes.STRING,
    pedido: DataTypes.STRING,
    notaFiscal: DataTypes.STRING,
    observacoes: DataTypes.TEXT,
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Agendado'
    },
    motivoCancelamento: DataTypes.STRING,
    obsCancelamento: DataTypes.TEXT,
    arquivoNF: {
        type: DataTypes.STRING, // Vamos salvar apenas o caminho/URL do arquivo PDF
        allowNull: true
    }
}, {
    tableName: 'agendamentos',
    timestamps: true // Cria automaticamente colunas createdAt e updatedAt
});

module.exports = Agendamento;