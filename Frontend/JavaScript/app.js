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

    // Utilizando FormData no lugar de um objeto simples JSON
    const formData = new FormData();
    formData.append('transportadora', document.getElementById("ag-transp").value.toUpperCase());
    formData.append('fornecedor', document.getElementById("ag-forn").value.toUpperCase());
    formData.append('motorista', document.getElementById("ag-motorista").value.toUpperCase());
    formData.append('telefone', document.getElementById("ag-telefone").value);
    formData.append('email', document.getElementById("ag-email").value);
    formData.append('placaVeiculo', document.getElementById("ag-placa").value.toUpperCase());
    formData.append('tipoVeiculo', document.getElementById("ag-veiculo").value.toUpperCase());
    formData.append('data', document.getElementById("ag-data").value);
    formData.append('horario', document.getElementById("ag-hora-ini").value);
    formData.append('tipoCarga', document.getElementById("ag-tipo-carga").value.toUpperCase());
    formData.append('peso', document.getElementById("ag-peso").value);
    formData.append('volume', document.getElementById("ag-volume").value);
    formData.append('pedido', valorPedido ? valorPedido.padStart(6, '0') : '-');
    formData.append('notaFiscal', document.getElementById("ag-notafiscal").value.padStart(9, '0'));
    formData.append('observacoes', document.getElementById("ag-obs").value);
    
    // Anexa o PDF bruto se ele existir no state
    if (state.arquivoUploadAg) {
        formData.append('arquivoNF', state.arquivoUploadAg);
    }

    Swal.fire({ title: 'Salvando...', text: 'Por favor, aguarde.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        if (state.protocoloEmEdicao) {
            await ApiController.atualizarAgendamento(state.protocoloEmEdicao, formData);
            Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'As informações foram salvas.', confirmButtonColor: '#3B82F6' }).then(() => {
                limparFormularioAgendamento();
                navTo('agendamentos'); 
            });
        } else {
            const novoAgendamentoSalvo = await ApiController.salvar(formData);
            Swal.fire({ icon: 'success', title: 'Agendamento Criado!', html: `Protocolo: <strong>${novoAgendamentoSalvo.protocolo}</strong>`, confirmButtonColor: '#3B82F6' }).then(() => {
                limparFormularioAgendamento();
                navTo('agendamentos'); 
            });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro de Servidor', text: 'Não foi possível salvar os dados.' });
    }
}

export async function confirmarCancelamento(event) {
    // Permanece inalterado do seu código original
    event.preventDefault();
    const protocoloEl = document.getElementById('canc-protocolo');
    const motivoEl = document.getElementById('canc-motivo');
    
    const protocolo = protocoloEl.value.trim();
    const motivo = motivoEl.value;
    const observacao = document.getElementById('canc-obs').value.trim();

    let formularioValido = true;
    let camposComErro = [];

    if (!protocolo) { formularioValido = false; camposComErro.push("Número do Protocolo"); protocoloEl.style.borderColor = "Red"; } else { protocoloEl.style.borderColor = ""; }
    if (!motivo) { formularioValido = false; camposComErro.push("Motivo do Cancelamento"); motivoEl.style.borderColor = "Red"; } else { motivoEl.style.borderColor = ""; }

    if (!formularioValido) {
        Swal.fire({ icon: 'warning', title: 'Atenção!', html: `Preencha:<br><br>• ${camposComErro.join("<br>• ")}` }); return;
    }

    Swal.fire({ title: 'Confirmar Cancelamento?', html: `Cancelar protocolo <strong>${protocolo}</strong>?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, cancelar' }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Cancelando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                await ApiController.atualizarStatus(protocolo, 'Cancelado', motivo, observacao);
                Swal.fire('Cancelado!', 'Agendamento cancelado.', 'success').then(() => {
                    document.getElementById('form-cancelar').reset();
                    navTo('agendamentos');
                });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Falha', text: 'Não foi possível cancelar.' });
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
            const naoFezUpload = !state.arquivoUploadEdit;
            
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
        Swal.fire({ icon: 'warning', title: 'Atenção!', html: `Preencha:<br><br>• ${camposComErro.join("<br>• ")}` });
        return;
    }

    const valorPedidoEdit = document.getElementById("edit-pedido").value.trim();

    const formDataEdit = new FormData();
    formDataEdit.append('transportadora', document.getElementById("edit-transp").value.toUpperCase());
    formDataEdit.append('fornecedor', document.getElementById("edit-forn").value.toUpperCase());
    formDataEdit.append('motorista', document.getElementById("edit-motorista").value.toUpperCase());
    formDataEdit.append('telefone', document.getElementById("edit-telefone").value);
    formDataEdit.append('email', document.getElementById("edit-email").value);
    formDataEdit.append('placaVeiculo', document.getElementById("edit-placa").value.toUpperCase());
    formDataEdit.append('tipoVeiculo', document.getElementById("edit-veiculo").value.toUpperCase());
    formDataEdit.append('data', document.getElementById("edit-data").value);
    formDataEdit.append('horario', document.getElementById("edit-hora-ini").value);
    formDataEdit.append('tipoCarga', document.getElementById("edit-tipo-carga").value.toUpperCase());
    formDataEdit.append('peso', document.getElementById("edit-peso").value);
    formDataEdit.append('volume', document.getElementById("edit-volume").value);
    formDataEdit.append('pedido', valorPedidoEdit ? valorPedidoEdit.padStart(6, '0') : '-');
    formDataEdit.append('notaFiscal', document.getElementById("edit-notafiscal").value.padStart(9, '0'));
    formDataEdit.append('observacoes', document.getElementById("edit-obs").value);
    
    // Anexa apenas se o usuário tiver feito upload de um novo arquivo na edição
    if (state.arquivoUploadEdit) {
        formDataEdit.append('arquivoNF', state.arquivoUploadEdit);
    }

    Swal.fire({ title: 'Salvando...', text: 'Por favor, aguarde.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        await ApiController.atualizarAgendamento(state.agendamentoOriginal.protocolo, formDataEdit);
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'As informações alteradas foram salvas.' }).then(() => {
            fecharModalEditar();
            renderAgendamentos(); 
        });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar as edições no banco.' });
    }
}

// exportarParaPDF e exportarParaExcel permanecem inalterados do seu código
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
window.toggleMenu = toggleMenu; window.navTo = navTo; window.renderAgendamentos = renderAgendamentos;
window.limparFiltros = limparFiltros; window.salvarAg = salvarAg; window.confirmarCancelamento = confirmarCancelamento;
window.abrirModalVisualizar = abrirModalVisualizar; window.fecharModalVisualizar = fecharModalVisualizar;
window.editarAgendamento = editarAgendamento; window.fecharModalEditar = fecharModalEditar; window.salvarEdicao = salvarEdicao;
window.exportarParaPDF = exportarParaPDF; window.exportarParaExcel = exportarParaExcel;