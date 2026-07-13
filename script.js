// ══════════════════════════════════════════════════════════
// NAVEGAÇÃO - CORSUL DOCKFLOW
// ══════════════════════════════════════════════════════════

const PAGE_TITLES = {
    dashboard: 'Menu Inicial',
    agendamentos: 'Meus Agendamentos',
    agendar: 'Agendar Descarga',
    cancelar: 'Cancelar Agendamento'
};

const PAGE_ACTIONS = {
    // Agora o botão de novo agendamento chama a página 'agendar'
    agendamentos: () => `<button class="btn btn-primary" onclick="navTo('agendar')">+ Novo Agendamento</button>`,
    dashboard: () => '',
    agendar: () => '',
    cancelar: () => ''
};

// ══════════════════════════════════════════════════════════
// CONTROLE DE PÁGINAS
// ══════════════════════════════════════════════════════════
function navTo(page) {
    // 1. Oculta todas as telas (sections com a classe .page)
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 2. Remove o destaque (classe active) de todos os itens do menu
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // 3. Mostra a página selecionada
    const pageElement = document.getElementById('page-' + page);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // 4. Marca o item do menu clicado como ativo (se não for o logo)
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // 5. Atualiza o título e os botões da Topbar
    const titleElement = document.getElementById('topbar-title');
    if (titleElement) titleElement.textContent = PAGE_TITLES[page] || 'Corsul DockFlow';
    
    const actionsElement = document.getElementById('topbar-actions');
    if (actionsElement) {
        actionsElement.innerHTML = PAGE_ACTIONS[page] ? PAGE_ACTIONS[page]() : '';
    }
    
    // 6. Executa lógicas específicas
    if (page === 'agendamentos') {
        if (typeof renderAgendamentos === 'function') renderAgendamentos();
    }
}

// ══════════════════════════════════════════════════════════
// INICIALIZAÇÃO DOS EVENTOS
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-item, .sidebar-logo');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const page = link.getAttribute('data-page');
            
            if (page) {
                // Como TUDO agora é página, basta chamar o navTo direto!
                navTo(page);
            }
        });
    });
});