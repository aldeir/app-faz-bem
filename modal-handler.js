// modal-handler.js

// Encontra os elementos do modal no DOM
const modal = document.getElementById('app-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButtons = document.getElementById('modal-buttons');

/**
 * Função genérica para exibir o modal.
 * Retorna uma Promise que resolve com base no botão clicado.
 * @param {string} title - O título do modal.
 * @param {string} message - A mensagem principal do modal.
 * @param {Array<Object>} buttons - Um array de objetos de botão, ex: [{ text: 'OK', class: 'bg-green-600', value: true }]
 */
function showModal(title, message, buttons) {
    return new Promise(resolve => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalButtons.innerHTML = ''; // Limpa botões antigos

        // Cria os novos botões
        buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.className = `w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${btnConfig.class}`;
            
            button.onclick = () => {
                modal.classList.add('hidden');
                resolve(btnConfig.value); // Resolve a promise com o valor do botão
            };
            modalButtons.appendChild(button);
        });

        modal.classList.remove('hidden'); // Exibe o modal
    });
}

/**
 * Exibe um modal de confirmação com botões "Confirmar" e "Cancelar".
 * @param {string} title - O título da confirmação.
 * @param {string} message - A pergunta de confirmação.
 * @returns {Promise<boolean>} - Resolve para `true` se confirmado, `false` se cancelado.
 */
export function showConfirmationModal(title, message) {
    const buttons = [
        { text: 'Confirmar', class: 'bg-red-600 hover:bg-red-700', value: true },
        { text: 'Cancelar', class: 'bg-gray-500 hover:bg-gray-600', value: false }
    ];
    return showModal(title, message, buttons);
}

/**
 * Exibe um modal de alerta simples com um botão "OK".
 * @param {string} title - O título do alerta.
 * @param {string} message - A mensagem do alerta.
 * @returns {Promise<boolean>} - Sempre resolve para `true` quando o botão OK é clicado.
 */
export function showAlertModal(title, message) {
    const buttons = [
        { text: 'OK', class: 'bg-blue-600 hover:bg-blue-700', value: true }
    ];
    return showModal(title, message, buttons);
}
