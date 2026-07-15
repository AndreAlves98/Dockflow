// ══════════════════════════════════════════════════════════
// CONFIGURAÇÕES E CONSTANTES
// ══════════════════════════════════════════════════════════
const PAGE_TITLES = {
    dashboard: 'Menu Inicial',
    agendamentos: 'Meus Agendamentos',
    agendar: 'Agendar Descarga',
    cancelar: 'Cancelar Agendamento'
};

const PAGE_ACTIONS = {
    agendamentos: () => `<button class="btn btn-primary" onclick="navTo('agendar')">+ Novo Agendamento</button>`,
    dashboard: () => '',
    agendar: () => '',
    cancelar: () => ''
};

// Mapeamento dos IDs reais do seu HTML
const CAMPOS_OBRIGATORIOS_AGENDAMENTO = [
    { id: "ag-forn", nome: "Fornecedor / Remetente" },
    { id: "ag-motorista", nome: "Motorista" },
    { id: "ag-telefone", nome: "Telefone" },
    { id: "ag-email", nome: "E-mail" },
    { id: "ag-placa", nome: "Placa do veículo" },
    { id: "ag-data", nome: "Data" },
    { id: "ag-hora-ini", nome: "Horário" },
    { id: "ag-volume", nome: "Volume" }
];

// ══════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    configurarValidacaoDinamica(); // Inicia a regra de remover borda vermelha ao digitar
    
    // Se abrir na tela de agendamentos, já renderiza a tabela
    if (document.getElementById('page-agendamentos')?.classList.contains('active')) {
        renderAgendamentos();
    }
});

// ══════════════════════════════════════════════════════════
// NAVEGAÇÃO E MENUS
// ══════════════════════════════════════════════════════════
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-item, .sidebar-logo');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const page = link.getAttribute('data-page');
            if (page) navTo(page);
        });
    });
}

function toggleMenu() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.querySelector('.sidebar-overlay')?.classList.toggle('active');
}

function navTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const pageElement = document.getElementById('page-' + page);
    if (pageElement) pageElement.classList.add('active');
    
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');
    
    const titleElement = document.getElementById('topbar-title');
    if (titleElement) titleElement.textContent = PAGE_TITLES[page] || 'Corsul DockFlow';
    
    const actionsElement = document.getElementById('topbar-actions');
    if (actionsElement) actionsElement.innerHTML = PAGE_ACTIONS[page] ? PAGE_ACTIONS[page]() : '';
    
    document.getElementById('sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');

    if (page === 'agendamentos') {
        renderAgendamentos();
    }
}

// ══════════════════════════════════════════════════════════
// VALIDAÇÃO DINÂMICA (REMOVER BORDA VERMELHA AO DIGITAR)
// ══════════════════════════════════════════════════════════
function configurarValidacaoDinamica() {
    CAMPOS_OBRIGATORIOS_AGENDAMENTO.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        
        if (elemento) {
            // Escuta cada vez que o usuário interage/digita no campo
            elemento.addEventListener('input', function() {
                // Se o campo não estiver vazio, remove a marcação vermelha
                if (this.value.trim() !== "") {
                    this.style.borderColor = "";
                }
            });
        }
    });
}

// ══════════════════════════════════════════════════════════
// SALVAR AGENDAMENTO E GERAR PROTOCOLO
// ══════════════════════════════════════════════════════════
function gerarProtocolo() {
    const ano = new Date().getFullYear();
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000); 
    return `PRT-${ano}-${numeroAleatorio}`;
}

// Esta função é chamada pelo botão do HTML: onclick="salvarAg()"
function salvarAg() {
    let formularioValido = true;
    let camposComErro = [];

    // Validação de envio
    CAMPOS_OBRIGATORIOS_AGENDAMENTO.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (!elemento || elemento.value.trim() === "") {
            formularioValido = false;
            camposComErro.push(campo.nome);
            if (elemento) elemento.style.borderColor = "red"; // Pinta de vermelho se vazio
        } else {
            if (elemento) elemento.style.borderColor = ""; // Garante que fique sem borda se válido
        }
    });

    if (!formularioValido) {
        alert("Por favor, preencha os seguintes campos obrigatórios:\n\n- " + camposComErro.join("\n- "));
        return; 
    }

    // Criação do objeto
    const protocoloGerado = gerarProtocolo();
    
    const novoAgendamento = {
        protocolo: protocoloGerado,
        status: 'Agendado', 
        transportadora: document.getElementById("ag-transp").value,
        fornecedor: document.getElementById("ag-forn").value,
        motorista: document.getElementById("ag-motorista").value,
        placaVeiculo: document.getElementById("ag-placa").value,
        tipoVeiculo: document.getElementById("ag-veiculo").value,
        data: document.getElementById("ag-data").value,
        horario: document.getElementById("ag-hora-ini").value,
        pedido: document.getElementById("ag-pedido").value || '-'
    };

    // Salva no LocalStorage
    let agendamentosSalvos = JSON.parse(localStorage.getItem('dockflow_agendamentos')) || [];
    agendamentosSalvos.push(novoAgendamento);
    localStorage.setItem('dockflow_agendamentos', JSON.stringify(agendamentosSalvos));

    alert(`Agendamento salvo com sucesso!\nProtocolo Gerado: ${protocoloGerado}`);
    
    // Limpa os campos após salvar
    CAMPOS_OBRIGATORIOS_AGENDAMENTO.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if(elemento) elemento.value = "";
    });
    document.getElementById("ag-transp").value = "";
    document.getElementById("ag-veiculo").value = "";
    document.getElementById("ag-pedido").value = "";

    // Navega para a tela de lista
    navTo('agendamentos');
}

// ══════════════════════════════════════════════════════════
// RENDERIZAR TABELA (MEUS AGENDAMENTOS)
// ══════════════════════════════════════════════════════════
function renderAgendamentos() {
    const tbody = document.getElementById('ag-tbody');
    const divVazia = document.getElementById('ag-empty');
    
    if (!tbody) return;

    let agendamentosSalvos = JSON.parse(localStorage.getItem('dockflow_agendamentos')) || [];

    // Limpa a tabela antes de preencher
    tbody.innerHTML = '';

    if (agendamentosSalvos.length === 0) {
        if(divVazia) divVazia.classList.remove('hidden');
    } else {
        if(divVazia) divVazia.classList.add('hidden');
        
        // Inverte para mostrar os mais recentes primeiro
        agendamentosSalvos.slice().reverse().forEach(ag => {
            const dataFormatada = ag.data.split('-').reverse().join('/');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ag.protocolo}</strong></td>
                <td>${dataFormatada}</td>
                <td>${ag.horario}</td>
                <td>-</td> <!-- Doca -->
                <td>-</td> <!-- NFs -->
                <td>${ag.pedido}</td>
                <td>${ag.transportadora || '-'}</td>
                <td>${ag.fornecedor}</td>
                <td>${ag.placaVeiculo}</td>
                <td><span style="background: #e0f2f1; color: #00796b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${ag.status}</span></td>
                <td>${ag.motorista}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}