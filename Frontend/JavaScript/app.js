// JavaScript/app.js
import { CONFIG, state, CAMPOS_EDIT_OBRIGATORIOS } from './config.js';
import { ApiController } from './api.js';
import { configurarUploadNF, configurarValidacaoDinamica } from './validations.js';
import { 
    initNavigation, navTo, toggleMenu, renderAgendamentos, 
    limparFiltros, limparFormularioAgendamento, abrirModalVisualizar, 
    fecharModalVisualizar, editarAgendamento, fecharModalEditar 
} from './ui.js';

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    configurarValidacaoDinamica();
    configurarUploadNF(); 
    
    const paginaSalva = localStorage.getItem(CONFIG.CURRENT_PAGE_KEY) || 'dashboard';
    navTo(paginaSalva);
});

// --- REGRAS DE NEGÓCIO ---

export async function salvarAg() {
    let formularioValido = true;
    let camposComErro = [];

    CONFIG.CAMPOS_OBRIGATORIOS.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        
        if (campo.id === 'ag-arquivo-nf') {
            if (!elemento || elemento.value.trim() === "") {
                formularioValido = false;
                camposComErro.push(campo.nome);
                document.getElementById('btn-ag-nf').classList.add('btn-error-border');
            } else {
                document.getElementById('btn-ag-nf').classList.remove('btn-error-border');
            }
        } 
        else {
            if (!elemento || elemento.value.trim() === "") {
                formularioValido = false;
                camposComErro.push(campo.nome);
                if (elemento) elemento.style.borderColor = "Red";
            } else {
                if (elemento) elemento.style.borderColor = "";
            }
        }
    });

    if (!formularioValido) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            html: `Por favor, preencha os seguintes campos:<br><br>• ${camposComErro.join("<br>• ")}`,
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const valorPedido = document.getElementById("ag-pedido").value.trim();

    const dadosFormulario = {
        transportadora: document.getElementById("ag-transp").value.toUpperCase(),
        fornecedor: document.getElementById("ag-forn").value.toUpperCase(),
        motorista: document.getElementById("ag-motorista").value.toUpperCase(),
        telefone: document.getElementById("ag-telefone").value,
        email: document.getElementById("ag-email").value,
        placaVeiculo: document.getElementById("ag-placa").value.toUpperCase(),
        tipoVeiculo: document.getElementById("ag-veiculo").value.toUpperCase(),
        data: document.getElementById("ag-data").value,
        horario: document.getElementById("ag-hora-ini").value,
        tipoCarga: document.getElementById("ag-tipo-carga").value.toUpperCase(),
        peso: document.getElementById("ag-peso").value,
        volume: document.getElementById("ag-volume").value,
        pedido: valorPedido ? valorPedido.padStart(6, '0') : '-',
        notaFiscal: document.getElementById("ag-notafiscal").value.padStart(9, '0'),
        observacoes: document.getElementById("ag-obs").value,
        // Caso o Base64UploadAg exista, envia a base64, senão envia nulo (adequado ao Java)
        arquivoNF: state.base64UploadAg ? state.base64UploadAg.base64 : null 
    };

    Swal.fire({
        title: 'Salvando...',
        text: 'Por favor, aguarde.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        if (state.protocoloEmEdicao) {
            await ApiController.atualizarAgendamento(state.protocoloEmEdicao, dadosFormulario);
            
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'As informações alteradas foram salvas.',
                confirmButtonColor: '#3B82F6'
            }).then(() => {
                limparFormularioAgendamento();
                navTo('agendamentos'); 
            });

        } else {
            // Enviamos para o backend e recebemos o objeto salvo (já com o protocolo gerado no Java)
            const novoAgendamentoSalvo = await ApiController.salvar(dadosFormulario);

            Swal.fire({
                icon: 'success',
                title: 'Agendamento Criado!',
                html: `As informações foram salvas no Banco de Dados.<br>Protocolo: <strong>${novoAgendamentoSalvo.protocolo}</strong>`,
                confirmButtonColor: '#3B82F6'
            }).then(() => {
                limparFormularioAgendamento();
                navTo('agendamentos'); 
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de Servidor',
            text: 'Não foi possível salvar os dados. Verifique a conexão com o servidor.',
            confirmButtonColor: '#d33'
        });
    }
}

export async function confirmarCancelamento(event) {
    event.preventDefault();
    
    const protocoloEl = document.getElementById('canc-protocolo');
    const motivoEl = document.getElementById('canc-motivo');
    
    const protocolo = protocoloEl.value.trim();
    const motivo = motivoEl.value;
    const observacao = document.getElementById('canc-obs').value.trim();

    let formularioValido = true;
    let camposComErro = [];

    if (!protocolo) {
        formularioValido = false;
        camposComErro.push("Número do Protocolo");
        protocoloEl.style.borderColor = "Red";
    } else {
        protocoloEl.style.borderColor = "";
    }

    if (!motivo) {
        formularioValido = false;
        camposComErro.push("Motivo do Cancelamento");
        motivoEl.style.borderColor = "Red";
    } else {
        motivoEl.style.borderColor = "";
    }

    if (!formularioValido) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            html: `Por favor, preencha os seguintes campos obrigatórios:<br><br>• ${camposComErro.join("<br>• ")}`,
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    Swal.fire({
        title: 'Confirmar Cancelamento?',
        html: `Deseja cancelar o protocolo <strong>${protocolo}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e53e3e',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Não, voltar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Cancelando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            try {
                await ApiController.atualizarStatus(protocolo, 'Cancelado', motivo, observacao);
                Swal.fire('Cancelado!', 'Agendamento cancelado no sistema.', 'success').then(() => {
                    document.getElementById('form-cancelar').reset();
                    navTo('agendamentos');
                });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Falha', text: 'Não foi possível encontrar ou cancelar este protocolo.' });
            }
        }
    });
}

export async function salvarEdicao() {
    let formularioValido = true;
    let camposComErro = [];

    CAMPOS_EDIT_OBRIGATORIOS.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        
        if (campo.id === 'edit-arquivo-nf') {
            const naoTemOriginal = !(state.agendamentoOriginal.arquivoNF);
            const naoFezUpload = !state.base64UploadEdit;
            
            if (naoTemOriginal && naoFezUpload) {
                formularioValido = false;
                camposComErro.push(campo.nome);
                document.getElementById('btn-edit-nf').classList.add('btn-error-border');
            } else {
                document.getElementById('btn-edit-nf').classList.remove('btn-error-border');
            }
        } 
        else if (!elemento || elemento.value.trim() === "") {
            formularioValido = false;
            camposComErro.push(campo.nome);
            if (elemento) elemento.style.borderColor = "Red";
        } else {
            if (elemento) elemento.style.borderColor = "";
        }
    });

    if (!formularioValido) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            html: `Por favor, preencha os seguintes campos:<br><br>• ${camposComErro.join("<br>• ")}`,
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const valorPedidoEdit = document.getElementById("edit-pedido").value.trim();

    const dadosEditados = {
        transportadora: document.getElementById("edit-transp").value.toUpperCase(),
        fornecedor: document.getElementById("edit-forn").value.toUpperCase(),
        motorista: document.getElementById("edit-motorista").value.toUpperCase(),
        telefone: document.getElementById("edit-telefone").value,
        email: document.getElementById("edit-email").value,
        placaVeiculo: document.getElementById("edit-placa").value.toUpperCase(),
        tipoVeiculo: document.getElementById("edit-veiculo").value.toUpperCase(),
        data: document.getElementById("edit-data").value,
        horario: document.getElementById("edit-hora-ini").value,
        tipoCarga: document.getElementById("edit-tipo-carga").value.toUpperCase(),
        peso: document.getElementById("edit-peso").value,
        volume: document.getElementById("edit-volume").value,
        pedido: valorPedidoEdit ? valorPedidoEdit.padStart(6, '0') : '-',
        notaFiscal: document.getElementById("edit-notafiscal").value.padStart(9, '0'),
        observacoes: document.getElementById("edit-obs").value,
        arquivoNF: state.base64UploadEdit ? state.base64UploadEdit.base64 : null // Envia apenas a nova Base64 se houver
    };

    let teveAlteracao = false;
    const chavesParaComparar = Object.keys(dadosEditados);

    for (let chave of chavesParaComparar) {
        if (chave === 'arquivoNF') {
            if (state.base64UploadEdit) teveAlteracao = true; 
            continue;
        }

        const valorOriginal = state.agendamentoOriginal[chave] === undefined || state.agendamentoOriginal[chave] === null ? '' : String(state.agendamentoOriginal[chave]);
        const valorEditado = dadosEditados[chave] === undefined || dadosEditados[chave] === null ? '' : String(dadosEditados[chave]);

        if (valorOriginal !== valorEditado) {
            teveAlteracao = true;
            break;
        }
    }

    if (!teveAlteracao) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma alteração',
            text: 'Nenhuma informação foi editada.',
            confirmButtonColor: '#3B82F6'
        }).then(() => {
            fecharModalEditar();
        });
        return;
    }

    Swal.fire({ title: 'Salvando...', text: 'Por favor, aguarde.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        await ApiController.atualizarAgendamento(state.agendamentoOriginal.protocolo, dadosEditados);

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'As informações alteradas foram salvas.',
            confirmButtonColor: '#3B82F6'
        }).then(() => {
            fecharModalEditar();
            renderAgendamentos(); 
        });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar as edições no banco de dados.' });
    }
}

export function exportarParaPDF(protocolo) {
    const elementoParaExportar = document.getElementById('mv-body');

    const opcoes = {
        margin: [15, 15, 15, 15],
        filename: `Agendamento_${protocolo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    Swal.fire({
        title: 'Gerando PDF...',
        text: 'Por favor, aguarde um instante.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();

            html2pdf().set(opcoes).from(elementoParaExportar).save().then(() => {
                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'O PDF foi gerado e o download será iniciado automaticamente.',
                    timer: 2500,
                    showConfirmButton: false
                });
            });
        }
    });
}

// Convertida para async para poder puxar os dados do banco antes de exportar
export async function exportarParaExcel() {
    Swal.fire({ title: 'Buscando dados...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const agendamentosSalvos = await ApiController.obterTodos();

        if (!agendamentosSalvos || agendamentosSalvos.length === 0) {
            Swal.fire({ icon: 'info', title: 'Aviso', text: 'Não há agendamentos no banco para exportar.' });
            return;
        }

        const termoBusca = document.getElementById('ag-search')?.value.toLowerCase().trim() || '';
        const filtroStatus = document.getElementById('ag-filter-status')?.value.toLowerCase() || '';
        const filtroData = document.getElementById('ag-filter-data')?.value || '';
        const filtroHora = document.getElementById('ag-filter-hora')?.value || '';

        const dadosParaExportar = agendamentosSalvos.filter(ag => {
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

        if (dadosParaExportar.length === 0) {
            Swal.fire({ icon: 'info', title: 'Lista Vazia', text: 'Nenhum agendamento corresponde aos filtros atuais.' });
            return;
        }

        const dadosMapeados = dadosParaExportar.map(ag => ({
            "Protocolo": ag.protocolo || "-",
            "Status": ag.status || "-",
            "Data do Agendamento": ag.data ? ag.data.split('-').reverse().join('/') : "-",
            "Horário": ag.horario || "-",
            "Transportadora": ag.transportadora || "-",
            "Fornecedor / Remetente": ag.fornecedor || "-",
            "Motorista": ag.motorista || "-",
            "Telefone": ag.telefone || "-",
            "E-mail": ag.email || "-",
            "Placa do Veículo": ag.placaVeiculo || "-",
            "Tipo de Veículo": ag.tipoVeiculo || "-",
            "Tipo de Carga": ag.tipoCarga || "-",
            "Peso Estimado (kg)": ag.peso || "-",
            "Volume": ag.volume || "-",
            "Nota Fiscal": ag.notaFiscal || "-",
            "Pedido de Compra": ag.pedido || "-",
            "Observações Gerais": ag.observacoes || "-",
            "Motivo do Cancelamento": ag.motivoCancelamento || "-",
            "Justificativa do Cancelamento": ag.obsCancelamento || "-"
        }));

        const worksheet = XLSX.utils.json_to_sheet(dadosMapeados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Agendamentos");

        const hoje = new Date();
        const dataString = `${String(hoje.getDate()).padStart(2, '0')}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`;

        XLSX.writeFile(workbook, `Corsul_Agendamentos_${dataString}.xlsx`);
        
        Swal.close(); // Fecha o aviso de loading

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro na Exportação', text: 'Falha ao buscar os dados do servidor para gerar o Excel.' });
    }
}

// --- INTEGRAÇÃO COM O HTML (EVENTOS INLINE) ---
window.toggleMenu = toggleMenu;
window.navTo = navTo;
window.renderAgendamentos = renderAgendamentos;
window.limparFiltros = limparFiltros;
window.salvarAg = salvarAg;
window.confirmarCancelamento = confirmarCancelamento;
window.abrirModalVisualizar = abrirModalVisualizar;
window.fecharModalVisualizar = fecharModalVisualizar;
window.editarAgendamento = editarAgendamento;
window.fecharModalEditar = fecharModalEditar;
window.salvarEdicao = salvarEdicao;
window.exportarParaPDF = exportarParaPDF;
window.exportarParaExcel = exportarParaExcel;