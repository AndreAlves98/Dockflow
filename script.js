// ══════════════════════════════════════════════════════════
// CONFIGURAÇÕES E CONSTANTES
// ══════════════════════════════════════════════════════════

const PAGE_TITLES = {
    dashboard: 'Menu Inicial',
    agendamentos: 'Agendamentos',
    agendar: 'Agendar Descarga',
    cancelar: 'Cancelar Agendamento'
}

const PAGE_ACTIONS = {
    agendamentos: () => '',
    dashboard: () => '',
    agendar: () => '',
    cancelar: () => ''
};

// Mapeamento dos campos obrigatórios do sistema
//constante que cria um array [] (lista) de objetos
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
            elemento.addEventListener('input', function () {
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
    const empresa = "COR";
    const sistema = "DF";

    // 1. Captura e formata a data atual (DDMMYYYY)
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // No JS, janeiro é 0, por isso o +1
    const ano = hoje.getFullYear();

    const dataFormatada = `${dia}${mes}${ano}`;

    // 2. Gera 2 caracteres aleatórios (misturando letras e números)
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let aleatorio = "";

    for (let i = 0; i < 2; i++) {
        const index = Math.floor(Math.random() * caracteres.length);
        aleatorio += caracteres[index];
    }

    // 3. Junta todas as peças no formato final
    return `${empresa}${dataFormatada}${sistema}${aleatorio}`;
    // Exemplo de saída: COR23072026DF56
}



// FUNÇÃO PARA INCLUIR UM AGENDAMENTO = onclick="salvarAg()"
function salvarAg() {

    let formularioValido = true;
    let camposComErro = [];


    //validação de Campos obrigatórios
    CAMPOS_OBRIGATORIOS_AGENDAMENTO.forEach(campo => {
        const elemento = document.getElementById(campo.id);

        //o elemento existe e é diferente de vazio?
        if (!elemento || elemento.value.trim() === "") {
            formularioValido = false;
            camposComErro.push(campo.nome); //guarda o nome na lista do alerta que vai lançar na tela
            if (elemento) elemento.style.borderColor = "Red"; // Pinta de vermelho se vazio
        } else {
            if (elemento) elemento.style.borderColor = ""; //limpa a borda vermelha
        }
    });


    //ALERTA DE CAMPOS OBRIGATORIOS

    if (!formularioValido) {
        // Transforma a lista de erros em texto com quebras de linha em HTML (<br>)
        const listaErros = camposComErro.join("<br>• ");
        //Alerta na tela
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            html: `Por favor, preencha os seguintes campos:<br><br>• ${listaErros}`,
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    //Criação do Objeto

    const protocoloGerado = gerarProtocolo();

    const novoAgendamento = {
        protocolo: protocoloGerado,
        status: 'Agendado', //todo registro nasce com esse status
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

    //Alerta de protocolo gerado
    Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        html: `Agendamento salvo com sucesso.<br><br>Protocolo Gerado: <strong>${protocoloGerado}</strong>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6' // Um verde padrão de sucesso
    });

    // Limpa os campos após salvar
    CAMPOS_OBRIGATORIOS_AGENDAMENTO.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento) elemento.value = "";
    });

    //Limpeza dos campos não obrigatórios
    document.getElementById("ag-transp").value = "";
    document.getElementById("ag-veiculo").value = "";
    document.getElementById("ag-pedido").value = "";
    document.getElementById("ag-peso").value = "";
    document.getElementById("ag-tipo-carga").value = "";

    // Navega para a tela de lista
    navTo('agendamentos');

}



// ══════════════════════════════════════════════════════════
// RENDERIZAR TABELA (MEUS AGENDAMENTOS)
// ══════════════════════════════════════════════════════════

function renderAgendamentos() {
    const tbody = document.getElementById('ag-tbody');
    const divVazia = document.getElementById('ag-empty');

    //se não encontrou a tabela preenchida pare!.
    if (!tbody) return;

    let agendamentosSalvos = JSON.parse(localStorage.getItem('dockflow_agendamentos')) || [];

    // Limpa a tabela antes de preencher
    tbody.innerHTML = '';


    // verifica se a tabela está vazia e mostra mensagem do HTML
    if (agendamentosSalvos.length === 0) {
        if (divVazia) divVazia.classList.remove('hidden');
    } else {
        if (divVazia) divVazia.classList.add('hidden');
    }

    //organiza os dados do mais novo para o mais velho (o push deixa invertido por isso issa reverse())
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
        <td><span class="badge-status">${ag.status}</span></td>
        <td>${ag.motorista}</td>
        `;
        tbody.appendChild(tr)
    })

}