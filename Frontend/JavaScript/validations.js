// JavaScript/validations.js
import { CONFIG, CAMPOS_EDIT_OBRIGATORIOS, state } from './config.js';

export function configurarUploadNF() {
    const setups = [
        { inputId: 'ag-arquivo-nf', displayId: 'nome-arquivo-nf', btnId: 'btn-ag-nf', isEdit: false },
        { inputId: 'edit-arquivo-nf', displayId: 'nome-edit-nf', btnId: 'btn-edit-nf', isEdit: true }
    ];

    setups.forEach(setup => {
        const inputEl = document.getElementById(setup.inputId);
        const displayEl = document.getElementById(setup.displayId);
        const btnEl = document.getElementById(setup.btnId);

        if (inputEl) {
            inputEl.addEventListener('change', function(e) {
                const file = e.target.files[0];
                
                if (!file) {
                    if (displayEl) displayEl.textContent = "Nenhum arquivo selecionado";
                    // Limpa o estado se o usuário cancelar a seleção
                    if (setup.isEdit) state.arquivoUploadEdit = null;
                    else state.arquivoUploadAg = null;
                    return;
                }

                if (file.type !== 'application/pdf') {
                    Swal.fire('Formato Inválido', 'Por favor, envie apenas arquivos no formato PDF.', 'error');
                    this.value = '';
                    if (displayEl) displayEl.textContent = "Nenhum arquivo selecionado";
                    return;
                }

                if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
                    Swal.fire('Arquivo muito grande', 'O sistema suporta PDFs de até 2MB.', 'error');
                    this.value = '';
                    if (displayEl) displayEl.textContent = "Nenhum arquivo selecionado";
                    return;
                }

                // Atualiza o visual
                if (displayEl) displayEl.innerHTML = `<span style="color: #10B981; font-weight: bold;">✓</span> ${file.name}`;
                if (btnEl) btnEl.classList.remove('btn-error-border'); 

                // Salva o arquivo bruto diretamente no estado em vez de usar FileReader/Base64
                if (setup.isEdit) {
                    state.arquivoUploadEdit = file;
                } else {
                    state.arquivoUploadAg = file;
                }
            });
        }
    });
}

export function configurarValidacaoDinamica() {
    CONFIG.CAMPOS_OBRIGATORIOS.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento) {
            elemento.addEventListener('input', function () {
                if (this.value.trim() !== "") this.style.borderColor = "";
            });
        }
    });

    CAMPOS_EDIT_OBRIGATORIOS.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento) {
            elemento.addEventListener('input', function () {
                if (this.value.trim() !== "") this.style.borderColor = "";
            });
        }
    });

    const camposCancelar = ['canc-protocolo', 'canc-motivo'];
    camposCancelar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', function () {
                if (this.value.trim() !== "") this.style.borderColor = "";
            });
            elemento.addEventListener('change', function () {
                if (this.value.trim() !== "") this.style.borderColor = "";
            });
        }
    });

    const camposParaUppercase = ['ag-transp', 'edit-transp', 'ag-forn', 'edit-forn', 'ag-motorista', 'edit-motorista'];
    camposParaUppercase.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        }
    });

    const camposPedido = ['ag-pedido', 'edit-pedido'];
    camposPedido.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.setAttribute('maxlength', '6');
            elemento.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            elemento.addEventListener('blur', function() {
                if (this.value.trim() !== "") {
                    this.value = this.value.padStart(6, '0');
                }
            });
        }
    });

    const camposTelefone = ['ag-telefone', 'edit-telefone'];
    camposTelefone.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.setAttribute('maxlength', '15'); 
            elemento.addEventListener('input', function() {
                let v = this.value.replace(/\D/g, '');
                if (v.length > 11) v = v.substring(0, 11);
                
                if (v.length > 10) {
                    this.value = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (v.length > 6) {
                    this.value = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else if (v.length > 2) {
                    this.value = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                } else if (v.length > 0) {
                    this.value = v.replace(/^(\d+)/, '($1'); 
                } else {
                    this.value = v;
                }
            });
        }
    });

    const camposEmail = ['ag-email', 'edit-email'];
    camposEmail.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                const emailDigitado = this.value.trim();
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailDigitado !== "") {
                    if (!regexEmail.test(emailDigitado)) {
                        this.style.borderColor = "Red";
                        Swal.fire({
                            icon: 'error',
                            title: 'E-mail Inválido',
                            text: 'Por favor, insira um formato de e-mail válido.',
                            confirmButtonColor: '#3085d6'
                        });
                    } else {
                        this.style.borderColor = "";
                    }
                }
            });
            elemento.addEventListener('input', function() {
                if (this.style.borderColor === 'red' || this.style.borderColor === 'Red') {
                    this.style.borderColor = '';
                }
            });
        }
    });

    const camposPlaca = ['ag-placa', 'edit-placa'];
    camposPlaca.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.setAttribute('maxlength', '7');
            elemento.addEventListener('input', function() {
                this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (this.style.borderColor === 'red' || this.style.borderColor === 'Red') {
                    this.style.borderColor = '';
                }
            });
            elemento.addEventListener('blur', function() {
                const placaDigitada = this.value.trim();
                const regexPlaca = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
                if (placaDigitada !== "") {
                    if (!regexPlaca.test(placaDigitada)) {
                        this.style.borderColor = "Red";
                        Swal.fire({
                            icon: 'error',
                            title: 'Placa Inválida',
                            text: 'Formato inválido. (ex: ABC1234 ou ABC1D23).',
                            confirmButtonColor: '#3085d6'
                        });
                    } else {
                        this.style.borderColor = "";
                    }
                }
            });
        }
    });

    const camposData = ['ag-data', 'edit-data'];
    camposData.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const hoje = new Date();
            const hojeLocal = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000));
            const dataMinimaStr = hojeLocal.toISOString().split('T')[0];

            const anoQueVem = new Date(hojeLocal);
            anoQueVem.setFullYear(anoQueVem.getFullYear() + 1);
            const dataMaximaStr = anoQueVem.toISOString().split('T')[0];

            elemento.setAttribute('min', dataMinimaStr);
            elemento.setAttribute('max', dataMaximaStr);

            elemento.addEventListener('blur', function() {
                const dataDigitada = this.value; 
                if (dataDigitada !== "") {
                    if (dataDigitada < dataMinimaStr) {
                        this.style.borderColor = "Red";
                        Swal.fire({ icon: 'error', title: 'Data Inválida', text: 'Não é permitido realizar agendamentos em datas passadas.', confirmButtonColor: '#3085d6' });
                        this.value = ''; 
                    } else if (dataDigitada > dataMaximaStr) {
                        this.style.borderColor = "Red";
                        Swal.fire({ icon: 'error', title: 'Data Muito Distante', text: 'Você só pode realizar agendamentos com até 1 ano de antecedência.', confirmButtonColor: '#3085d6' });
                        this.value = ''; 
                    } else {
                        this.style.borderColor = "";
                    }
                }
            });
            elemento.addEventListener('input', function() {
                if (this.style.borderColor === 'red' || this.style.borderColor === 'Red') this.style.borderColor = '';
            });
        }
    });

    const camposHora = ['ag-hora-ini', 'edit-hora-ini'];
    camposHora.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                const horaDigitada = this.value; 
                if (horaDigitada !== "") {
                    if (horaDigitada < "07:30" || horaDigitada > "18:00") {
                        this.style.borderColor = "Red";
                        Swal.fire({ icon: 'warning', title: 'Horário Indisponível', text: 'O horário de funcionamento é das 07:30 às 18:00.', confirmButtonColor: '#3085d6' });
                        this.value = ''; 
                    } else {
                        this.style.borderColor = "";
                    }
                }
            });
            elemento.addEventListener('input', function() {
                if (this.style.borderColor === 'red' || this.style.borderColor === 'Red') this.style.borderColor = '';
            });
        }
    });
}