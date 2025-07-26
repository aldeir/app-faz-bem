// modal-handler.js (v2.8 - Final)

// Encontra os elementos do modal no DOM
const modal = document.getElementById('app-modal');
const modalTitle = document.getElementById('modal-title');
// ALTERADO: de modalMessage para modalMessageBody para refletir que pode conter HTML
const modalMessageBody = document.getElementById('modal-message-body'); 
const modalButtons = document.getElementById('modal-buttons');

/**
 * Função genérica para exibir o modal.
 * Retorna uma Promise que resolve com base no botão clicado.
 */
function showModal(title, content, buttons, isHtmlContent = false) {
    return new Promise(resolve => {
        modalTitle.textContent = title;
        modalButtons.innerHTML = ''; // Limpa botões antigos

        // Define o conteúdo como texto ou como HTML
        if (isHtmlContent) {
            modalMessageBody.innerHTML = content;
        } else {
            modalMessageBody.textContent = content;
        }

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
    return showModal(title, message, buttons, false);
}

/**
 * Exibe um modal de alerta simples com um botão "OK".
 */
export function showAlertModal(title, message) {
    const buttons = [
        { text: 'OK', class: 'bg-blue-600 hover:bg-blue-700', value: true }
    ];
    return showModal(title, message, buttons, false);
}

/**
 * NOVO: Exibe um modal para mostrar detalhes formatados em HTML.
 * @param {string} title - O título do modal.
 * @param {string} contentHtml - O conteúdo em formato de string HTML.
 */
export function showDetailsModal(title, contentHtml) {
    const buttons = [
        { text: 'Fechar', class: 'bg-gray-500 hover:bg-gray-600', value: true }
    ];
    // O último parâmetro 'true' indica que o conteúdo é HTML
    return showModal(title, contentHtml, buttons, true); 
}
