// modal-handler.js (v3.0 - Centralizado e Autoinjetável)

// --- Estrutura HTML do Modal ---
// O código HTML que antes era duplicado agora vive aqui.
const MODAL_HTML = `
<div id="app-modal" class="hidden fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div id="modal-icon-container" class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        </div>
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title"></h3>
                        <div class="mt-2">
                            <div class="text-sm text-gray-600 space-y-2" id="modal-message-body"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse" id="modal-buttons"></div>
        </div>
    </div>
</div>
`;

// Ícones para diferentes tipos de modais
const MODAL_ICONS = {
    info: `<svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    success: `<svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    warning: `<svg class="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    error: `<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
};

const MODAL_ICON_BG = {
    info: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
};


/**
 * Verifica se o modal existe no DOM e, se não, o injeta.
 */
function injectModalIfNeeded() {
    if (!document.getElementById('app-modal')) {
        const modalWrapper = document.createElement('div');
        modalWrapper.innerHTML = MODAL_HTML;
        document.body.appendChild(modalWrapper.firstChild);
    }
}

/**
 * Função genérica para exibir o modal.
 * Retorna uma Promise que resolve com base no botão clicado.
 */
function showModal(title, content, buttons, options = {}) {
    return new Promise(resolve => {
        injectModalIfNeeded();

        // Seleciona os elementos do DOM APÓS garantir que eles existem
        const modal = document.getElementById('app-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessageBody = document.getElementById('modal-message-body');
        const modalButtons = document.getElementById('modal-buttons');
        const modalIconContainer = document.getElementById('modal-icon-container');

        const {
            isHtmlContent = false,
            iconType = 'info' // 'info', 'success', 'warning', 'error'
        } = options;


        modalTitle.textContent = title;
        modalButtons.innerHTML = ''; // Limpa botões antigos

        // Define o conteúdo como texto ou como HTML
        if (isHtmlContent) {
            modalMessageBody.innerHTML = content;
        } else {
            modalMessageBody.textContent = content;
        }

        // Define o ícone e a cor de fundo
        modalIconContainer.innerHTML = MODAL_ICONS[iconType] || MODAL_ICONS.info;
        modalIconContainer.className = `mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${MODAL_ICON_BG[iconType] || MODAL_ICON_BG.info}`;


        buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.className = `w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${btnConfig.class}`;
            
            button.onclick = () => {
                modal.classList.add('hidden');
                resolve(btnConfig.value);
            };
            modalButtons.appendChild(button);
        });

        modal.classList.remove('hidden');
    });
}

/**
 * Exibe um modal de confirmação com botões "Confirmar" e "Cancelar".
 */
export function showConfirmationModal(title, message) {
    const buttons = [
        { text: 'Confirmar', class: 'bg-red-600 hover:bg-red-700', value: true },
        { text: 'Cancelar', class: 'bg-gray-500 hover:bg-gray-600', value: false }
    ];
    return showModal(title, message, buttons, { iconType: 'warning' });
}

/**
 * Exibe um modal de alerta simples com um botão "OK".
 */
export function showAlertModal(title, message) {
    const buttons = [
        { text: 'OK', class: 'bg-blue-600 hover:bg-blue-700', value: true }
    ];
    return showModal(title, message, buttons, { iconType: 'info' });
}

/**
 * Exibe um modal para mostrar detalhes formatados em HTML.
 */
export function showDetailsModal(title, contentHtml) {
    const buttons = [
        { text: 'Fechar', class: 'bg-gray-500 hover:bg-gray-600', value: true }
    ];
    // O último parâmetro 'true' indica que o conteúdo é HTML
    return showModal(title, contentHtml, buttons, { isHtmlContent: true, iconType: 'info' }); 
}
