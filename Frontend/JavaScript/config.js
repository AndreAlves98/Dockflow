// JavaScript/config.js

export const CONFIG = {
    PAGE_TITLES: {
        dashboard: 'Menu Inicial',
        agendamentos: 'Agendamentos',
        agendar: 'Agendar Descarga',
        cancelar: 'Cancelar Agendamento'
    },
    STORAGE_KEY: 'dockflow_agendamentos',
    CURRENT_PAGE_KEY: 'dockflow_pagina_atual',
    CAMPOS_OBRIGATORIOS: [
        { id: "ag-forn", nome: "Fornecedor / Remetente" },
        { id: "ag-motorista", nome: "Motorista" },
        { id: "ag-telefone", nome: "Telefone" },
        { id: "ag-email", nome: "E-mail" },
        { id: "ag-placa", nome: "Placa do veículo" },
        { id: "ag-data", nome: "Data" },
        { id: "ag-hora-ini", nome: "Horário" },
        { id: "ag-volume", nome: "Volume" },
        { id: "ag-notafiscal", nome: "Nota Fiscal" },
        { id: "ag-arquivo-nf", nome: "Anexo do PDF" }
    ]
};

export const CAMPOS_EDIT_OBRIGATORIOS = [
    { id: "edit-forn", nome: "Fornecedor / Remetente" },
    { id: "edit-motorista", nome: "Motorista" },
    { id: "edit-telefone", nome: "Telefone" },
    { id: "edit-email", nome: "E-mail" },
    { id: "edit-placa", nome: "Placa do veículo" },
    { id: "edit-data", nome: "Data" },
    { id: "edit-hora-ini", nome: "Horário" },
    { id: "edit-volume", nome: "Volume" },
    { id: "edit-notafiscal", nome: "Nota Fiscal" },
    { id: "edit-arquivo-nf", nome: "Anexo do PDF" }
];

// Estado global compartilhado entre os arquivos
export const state = {
    agendamentoOriginal: null,
    protocoloEmEdicao: null,
    base64UploadAg: null,
    base64UploadEdit: null
};