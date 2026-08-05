const API_BASE_URL = 'http://localhost:8080/api/agendamentos';

export const ApiController = {
    obterTodos: async function () {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
            return await response.json();
        } catch (error) {
            console.error("Falha na comunicação com a API:", error);
            return [];
        }
    },
    
    salvar: async function (dados) {
        const isFormData = dados instanceof FormData;
        
        const options = {
            method: 'POST',
            // Se for FormData (com arquivo), envia direto. Se não, transforma em string JSON.
            body: isFormData ? dados : JSON.stringify(dados) 
        };

        // O navegador precisa definir o cabeçalho 'multipart/form-data' sozinho.
        // Só setamos application/json se NÃO tiver arquivo no meio.
        if (!isFormData) {
            options.headers = { 'Content-Type': 'application/json' };
        }

        const response = await fetch(API_BASE_URL, options);
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
        const isFormData = dadosAtualizados instanceof FormData;
        
        const options = {
            method: 'PUT',
            body: isFormData ? dadosAtualizados : JSON.stringify(dadosAtualizados)
        };

        if (!isFormData) {
            options.headers = { 'Content-Type': 'application/json' };
        }

        const response = await fetch(`${API_BASE_URL}/${protocolo}`, options);
        if (!response.ok) throw new Error('Erro ao atualizar agendamento');
        return await response.json();
    }
};