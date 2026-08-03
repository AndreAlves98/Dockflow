
const API_BASE_URL = 'http://localhost:8080/api/agendamentos';

export const ApiController = {
    obterTodos: async function () {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
            return await response.json();
        } catch (error) {
            console.error("Falha na comunicação com a API:", error);
            return []; // Retorna array vazio para não quebrar a tela em caso de falha
        }
    },
    
    salvar: async function (agendamento) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento)
        });
        if (!response.ok) throw new Error('Erro ao salvar no banco de dados');
        return await response.json();
    },
    
    atualizarStatus: async function (protocolo, novoStatus, motivo, obs) {
        const payload = { status: novoStatus, motivoCancelamento: motivo, obsCancelamento: obs };
        const response = await fetch(`${API_BASE_URL}/${protocolo}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return await response.json();
    },
    
    atualizarAgendamento: async function (protocolo, dadosAtualizados) {
        const response = await fetch(`${API_BASE_URL}/${protocolo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar agendamento');
        return await response.json();
    }
};