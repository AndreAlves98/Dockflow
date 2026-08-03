// JavaScript/ui.js
import { CONFIG, state, CAMPOS_EDIT_OBRIGATORIOS } from './config.js';
import { ApiController } from './api.js';

export function initNavigation() {
    document.querySelectorAll('.nav-item, .sidebar-logo').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) navTo(page);
        });
    });
}

export function toggleMenu() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.querySelector('.sidebar-overlay')?.classList.toggle('active');
}

export function navTo(page) {
    localStorage.setItem(CONFIG.CURRENT_PAGE_KEY, page);

    document.querySelectorAll('.page, .nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById('page-' + page)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    const titleElement = document.getElementById('topbar-title');
    if (titleElement) titleElement.textContent = CONFIG.PAGE_TITLES[page] || 'Corsul DockFlow';

    document.getElementById('sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');

    if (page === 'agendamentos') renderAgendamentos();

    if (page === 'agendar' && !state.protocoloEmEdicao) {
        limparFormularioAgendamento();
    }
}

export function limparFormularioAgendamento() {
    state.protocoloEmEdicao = null;
    document.getElementById('modal-ag-title').textContent = 'Novo Agendamento';

    document.querySelectorAll('#page-agendar input, #page-agendar select, #page-agendar textarea').forEach(el => {
        el.value = "";
        el.style.borderColor = "";
    });

    state.base64UploadAg = null;
    const infoArquivo = document.getElementById('nome-arquivo-nf');
    if (infoArquivo) infoArquivo.textContent = "Nenhum arquivo selecionado";
    document.getElementById('btn-ag-nf')?.classList.remove('btn-error-border');

    const btnVoltar = document.querySelector('#page-agendar .modal-ft .btn-outline');
    if (btnVoltar) {
        btnVoltar.setAttribute('onclick', "navTo('dashboard')");
    }
}

export function limparFiltros() {
    ['ag-search', 'ag-filter-status', 'ag-filter-data', 'ag-filter-hora'].forEach(id => {
        document.getElementById(id).value = '';
    });
    renderAgendamentos();
}

export async function renderAgendamentos() {
    const tbody = document.getElementById('ag-tbody');
    const divVazia = document.getElementById('ag-empty');
    if (!tbody) return;

    // Conectando com a API do Java
    const agendamentosSalvos = await ApiController.obterTodos();

    const termoBusca = document.getElementById('ag-search')?.value.toLowerCase().trim() || '';
    const filtroStatus = document.getElementById('ag-filter-status')?.value.toLowerCase() || '';
    const filtroData = document.getElementById('ag-filter-data')?.value || '';
    const filtroHora = document.getElementById('ag-filter-hora')?.value || '';

    const agendamentosFiltrados = agendamentosSalvos.filter(ag => {
        const matchStatus = filtroStatus === '' || (ag.status && ag.status.toLowerCase() === filtroStatus);
        const matchData = filtroData === '' || ag.data === filtroData;
        const matchHora = filtroHora === '' || ag.horario === filtroHora;

        let matchBusca = true;
        if (termoBusca !== '') {
            matchBusca = Object.values(ag).some(val => {
                if (typeof val === 'object' && val !== null) return false;
                return String(val).toLowerCase().includes(termoBusca);
            });
        }
        return matchStatus && matchData && matchHora && matchBusca;
    });

    const elContador = document.getElementById('ag-contador');
    if (elContador) elContador.textContent = agendamentosFiltrados.length;

    tbody.innerHTML = '';

    if (agendamentosFiltrados.length === 0) {
        if (divVazia) divVazia.classList.remove('hidden');
    } else {
        if (divVazia) divVazia.classList.add('hidden');

        agendamentosFiltrados.slice().reverse().forEach(ag => {
            const dataFormatada = ag.data ? ag.data.split('-').reverse().join('/') : '-';
            const tr = document.createElement('tr');

            tr.classList.add('tr-clickable');
            tr.ondblclick = () => window.abrirModalVisualizar(ag.protocolo);
            if (ag.status === 'Cancelado') tr.style.opacity = '0.7';

            const descVeiculo = (ag.tipoVeiculo || '-') + ' - ' + (ag.placaVeiculo || '-');

            tr.innerHTML = `
            <td data-label="Data / Hora"><strong>${dataFormatada}</strong><br><span style="font-size: 11px; color: var(--slate-4);">${ag.horario || '-'}</span></td>
            <td data-label="Fornecedor"><strong>${ag.fornecedor || '-'}</strong></td>
            <td data-label="Transportadora">${ag.transportadora || '-'}</td>
            <td data-label="Doca">-</td>
            <td data-label="Status"><span class="badge-status status-${(ag.status || '').toLowerCase()}">${ag.status || '-'}</span></td>
            <td data-label="Veículo / Motorista"><span style="text-transform: uppercase;">${descVeiculo}</span><br><span style="font-size: 11px; color: var(--slate-4);">${ag.motorista || '-'}</span></td>
            <td data-label="NF">${ag.notaFiscal || '-'}</td>
            <td data-label="Pedido">${ag.pedido || '-'}</td>
            <td data-label="Protocolo"><strong>${ag.protocolo || '-'}</strong></td>
            <td class="td-acoes" data-label="Ações">
                <button class="btn-acao view" onclick="abrirModalVisualizar('${ag.protocolo}')" title="Visualizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
                        <path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path>
                    </svg>
                </button>
                <button class="btn-acao edit" onclick="editarAgendamento('${ag.protocolo}')" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="m17.71 7.29-3-3a.996.996 0 0 0-1.41 0l-11.01 11A1 1 0 0 0 2 16v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l11-11a.996.996 0 0 0 0-1.41ZM5.59 18H4v-1.59l7.5-7.5 1.59 1.59zm8.91-8.91L12.91 7.5 14 6.41 15.59 8zM11 18h11v2H11z"></path>
                    </svg>
                </button>
            </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

export async function abrirModalVisualizar(protocolo) {
    const agendamentos = await ApiController.obterTodos();
    const ag = agendamentos.find(a => a.protocolo === protocolo);
    if (!ag) return;

    const dataFormatada = ag.data ? ag.data.split('-').reverse().join('/') : '-';

    let htmlCancelamento = '';
    if ((ag.status || '').toLowerCase() === 'cancelado') {
        htmlCancelamento = `
            <div class="form-sec" style="color: var(--red); border-bottom-color: var(--red-lt);">Detalhes do Cancelamento</div>
            <div class="detail-grid" style="margin-bottom: 20px;">
                <div class="dl-row" style="grid-column: span 2;"><span class="dl">Motivo</span><span class="dv"><strong>${ag.motivoCancelamento || '-'}</strong></span></div>
                <div class="dl-row" style="grid-column: span 2;"><span class="dl">Justificativa</span><span class="dv">${ag.obsCancelamento || '-'}</span></div>
            </div>
        `;
    }

    let btnDownloadHtml = '-';
    if (ag.arquivoNF) {
        // Trata o Base64 vindo diretamente do Java
        const base64 = typeof ag.arquivoNF === 'string' ? ag.arquivoNF : ag.arquivoNF.base64;
        
        if (base64) {
            btnDownloadHtml = `<a href="${base64}" download="Nota_Fiscal_Anexo.pdf" style="color: #3B82F6; text-decoration: underline; font-weight: bold;">📥 Baixar PDF</a>`;
        }
    }

    document.getElementById('mv-body').innerHTML = `
        <div class="form-sec" style="margin-top: 0;">Status e Identificação</div>
        <div class="detail-grid" style="margin-bottom: 20px;">
            <div class="dl-row"><span class="dl">Protocolo</span><span class="dv"><strong>${ag.protocolo}</strong></span></div>
            <div class="dl-row"><span class="dl">Status</span><span class="dv"><span class="badge-status status-${(ag.status || '').toLowerCase()}">${ag.status || '-'}</span></span></div>
            <div class="dl-row"><span class="dl">Data do Agendamento</span><span class="dv">${dataFormatada}</span></div>
            <div class="dl-row"><span class="dl">Horário</span><span class="dv">${ag.horario || '-'}</span></div>
        </div>

        <div class="form-sec">Dados do Transporte</div>
        <div class="detail-grid" style="margin-bottom: 20px;">
            <div class="dl-row"><span class="dl">Transportadora</span><span class="dv">${ag.transportadora || '-'}</span></div>
            <div class="dl-row"><span class="dl">Fornecedor / Remetente</span><span class="dv">${ag.fornecedor || '-'}</span></div>
            <div class="dl-row"><span class="dl">Motorista</span><span class="dv">${ag.motorista || '-'}</span></div>
            <div class="dl-row"><span class="dl">Placa do Veículo</span><span class="dv">${ag.placaVeiculo || '-'}</span></div>
            <div class="dl-row"><span class="dl">Telefone</span><span class="dv">${ag.telefone || '-'}</span></div>
            <div class="dl-row"><span class="dl">E-mail</span><span class="dv">${ag.email || '-'}</span></div>
            <div class="dl-row"><span class="dl">Tipo de Veículo</span><span class="dv" style="text-transform: uppercase;">${ag.tipoVeiculo || '-'}</span></div>
        </div>

        <div class="form-sec">Detalhes da Carga</div>
        <div class="detail-grid" style="margin-bottom: 20px;">
            <div class="dl-row"><span class="dl">Tipo de Carga</span><span class="dv" style="text-transform: uppercase;">${ag.tipoCarga || '-'}</span></div>
            <div class="dl-row"><span class="dl">Peso Estimado (kg)</span><span class="dv">${ag.peso || '-'}</span></div>
            <div class="dl-row"><span class="dl">Volume</span><span class="dv">${ag.volume || '-'}</span></div>
            <div class="dl-row"><span class="dl">Nota Fiscal</span><span class="dv">${ag.notaFiscal || '-'}</span></div>
            <div class="dl-row"><span class="dl">Pedido de Compra</span><span class="dv">${ag.pedido || '-'}</span></div>
            <div class="dl-row" style="grid-column: span 2;"><span class="dl">Anexo (PDF)</span><span class="dv">${btnDownloadHtml}</span></div>
        </div>

        <div class="form-sec">Observações Gerais</div>
        <div class="detail-grid" style="margin-bottom: 20px;">
            <div class="dl-row" style="grid-column: span 2;">
                <span class="dv">${ag.observacoes ? ag.observacoes.replace(/\n/g, '<br>') : '<span style="color: var(--slate-3);">Nenhuma observação informada.</span>'}</span>
            </div>
        </div>

        ${htmlCancelamento}
    `;

    document.getElementById('btn-editar-modal')?.setAttribute('onclick', `window.editarAgendamento('${ag.protocolo}')`);
    document.getElementById('btn-pdf-modal')?.setAttribute('onclick', `window.exportarParaPDF('${ag.protocolo}')`);
    document.getElementById('modal-visualizar').classList.add('open');
}

export function fecharModalVisualizar() {
    document.getElementById('modal-visualizar').classList.remove('open');
}

export async function editarAgendamento(protocolo) {
    fecharModalVisualizar();

    const agendamentos = await ApiController.obterTodos();
    const ag = agendamentos.find(a => a.protocolo === protocolo);
    if (!ag) return;

    if ((ag.status || '').toLowerCase() !== 'agendado') {
        Swal.fire({
            icon: 'error',
            title: 'Ação Bloqueada',
            text: 'Apenas agendamentos com o status "Agendado" podem ser editados.',
            confirmButtonColor: '#3B82F6'
        });
        return;
    }

    state.agendamentoOriginal = { ...ag };
    state.base64UploadEdit = null;

    document.getElementById("edit-transp").value = ag.transportadora || "";
    document.getElementById("edit-forn").value = ag.fornecedor || "";
    document.getElementById("edit-motorista").value = ag.motorista || "";
    document.getElementById("edit-telefone").value = ag.telefone || "";
    document.getElementById("edit-email").value = ag.email || "";
    document.getElementById("edit-placa").value = ag.placaVeiculo || "";

    document.getElementById("edit-veiculo").value = (ag.tipoVeiculo || "").toLowerCase();
    document.getElementById("edit-tipo-carga").value = (ag.tipoCarga || "").toLowerCase();

    document.getElementById("edit-data").value = ag.data || "";
    document.getElementById("edit-hora-ini").value = ag.horario || "";
    document.getElementById("edit-peso").value = ag.peso || "";
    document.getElementById("edit-volume").value = ag.volume || "";
    document.getElementById("edit-notafiscal").value = (ag.notaFiscal && ag.notaFiscal !== '000000000') ? ag.notaFiscal : "";

    document.getElementById("edit-pedido").value = (ag.pedido && ag.pedido !== '-') ? ag.pedido.replace(/^0+/, '') : "";
    document.getElementById("edit-obs").value = ag.observacoes || "";

    const infoArquivo = document.getElementById('nome-edit-nf');
    if (ag.arquivoNF && infoArquivo) {
        infoArquivo.innerHTML = `Arquivo atual salvo. <br>Envie outro apenas se quiser substituir.`;
        const btnEditFile = document.getElementById('btn-edit-nf');
        if (btnEditFile) btnEditFile.classList.remove('btn-error-border');
    } else if (infoArquivo) {
        infoArquivo.textContent = "Nenhum arquivo selecionado";
    }

    CAMPOS_EDIT_OBRIGATORIOS.forEach(campo => {
        const el = document.getElementById(campo.id);
        if (el) el.style.borderColor = "";
    });

    document.getElementById('modal-editar').classList.add('open');
}

export function fecharModalEditar() {
    document.getElementById('modal-editar').classList.remove('open');
    state.agendamentoOriginal = null;
    state.base64UploadEdit = null;
    document.getElementById('edit-arquivo-nf').value = "";
}