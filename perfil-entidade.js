import { db, storage, paths } from './app-config.js';
import { doc, getDoc, writeBatch, storageRef, uploadBytes, getDownloadURL } from './firebase-services.js';
import { injectHeader } from './app-header.js';
import { guard } from './route-guard.js';

// --- ELEMENTOS DO DOM ---
const loadingView = document.getElementById('loading-view');
const profileView = document.getElementById('profile-view');
const profileForm = document.getElementById('profile-form');
const saveBtn = document.getElementById('save-profile-btn');
const saveBtnText = document.getElementById('save-btn-text');
const saveBtnSpinner = document.getElementById('save-btn-spinner');
const saveFeedback = document.getElementById('save-feedback');
const logoPreview = document.getElementById('logo-preview');
const logoUploadInput = document.getElementById('logo-upload-input');
const cropperModal = document.getElementById('cropper-modal');
const imageToCrop = document.getElementById('image-to-crop');
const cancelCropBtn = document.getElementById('cancel-crop-btn');
const confirmCropBtn = document.getElementById('confirm-crop-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const actionButtonsContainer = document.getElementById('action-buttons-container');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editButtonContainer = document.getElementById('edit-button-container');

let currentUserSession = null;
let cropper;
let croppedImageBlob = null;
let originalProfileData = {}; // Guarda os dados originais para o cancelamento

// --- INICIALIZAÇÃO ---
async function initializeApp() {
    await injectHeader();
    
    // Use route guard for authentication and authorization
    currentUserSession = await guard({
        requireAuth: true,
        requiredRoles: ['entidade'],
        requireApprovedEntity: true
    });

    // If guard returns null, user was redirected
    if (!currentUserSession) {
        return;
    }

    // Load profile data for authorized entity
    loadProfileData(currentUserSession.auth.uid);
}

// --- CONTROLO DO MODO DE EDIÇÃO ---
function toggleEditMode(isEditing) {
    const inputs = profileForm.querySelectorAll('input, textarea');
    const editableFields = ['ent-nome-fantasia', 'ent-descricao', 'ent-cep', 'ent-rua', 'ent-numero', 'ent-bairro', 'rep-name', 'rep-dob', 'rep-phone', 'rep-cargo'];
    
    inputs.forEach(input => {
        if (editableFields.includes(input.id)) {
            input.disabled = !isEditing;
        }
    });

    editButtonContainer.classList.toggle('hidden', isEditing);
    actionButtonsContainer.classList.toggle('hidden', !isEditing);
}

// --- CARREGAMENTO DE DADOS ---
async function loadProfileData(uid, forceReload = false) {
    if (!forceReload && Object.keys(originalProfileData).length > 0) {
        populateForm(originalProfileData.entidadeData, originalProfileData.representanteData);
        return;
    }
    
    try {
        loadingView.classList.remove('hidden');
        profileView.classList.add('hidden');

        const entidadeDocRef = doc(db, paths.entidadeDoc(uid));
        const representanteDocRef = doc(db, paths.representanteDoc(uid, uid));

        const [entidadeSnap, representanteSnap] = await Promise.all([
            getDoc(entidadeDocRef),
            getDoc(representanteDocRef)
        ]);

        if (!entidadeSnap.exists() || !representanteSnap.exists()) {
            throw new Error("Dados do perfil não encontrados.");
        }

        originalProfileData = {
            entidadeData: entidadeSnap.data(),
            representanteData: representanteSnap.data()
        };
        
        populateForm(originalProfileData.entidadeData, originalProfileData.representanteData);
        
    } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        loadingView.innerHTML = `<p class="text-red-500">Não foi possível carregar os dados do perfil.</p>`;
    } finally {
        loadingView.classList.add('hidden');
        profileView.classList.remove('hidden');
    }
}

function populateForm(entidadeData, representanteData) {
    // Cabeçalho e logo
    document.getElementById('entity-name-display').textContent = entidadeData.dadosEntidade.nomeFantasia || 'Nome não definido';
    document.getElementById('entity-email-display').textContent = representanteData.email || '';
    logoPreview.src = entidadeData.logoUrl || 'https://placehold.co/128x128/e2e8f0/cbd5e0?text=Logo';

    // Seção Entidade
    document.getElementById('ent-nome-fantasia').value = entidadeData.dadosEntidade.nomeFantasia || '';
    document.getElementById('ent-razao-social').value = entidadeData.dadosEntidade.razaoSocial || '';
    document.getElementById('ent-cnpj').value = entidadeData.dadosEntidade.cnpj || '';
    document.getElementById('ent-descricao').value = entidadeData.dadosEntidade.descricao || '';
    document.getElementById('ent-cep').value = entidadeData.dadosEntidade.endereco?.cep || '';
    document.getElementById('ent-rua').value = entidadeData.dadosEntidade.endereco?.rua || '';
    document.getElementById('ent-numero').value = entidadeData.dadosEntidade.endereco?.numero || '';
    document.getElementById('ent-bairro').value = entidadeData.dadosEntidade.endereco?.bairro || '';

    // Seção Representante
    document.getElementById('rep-name').value = representanteData.nomeCompleto || '';
    document.getElementById('rep-email').value = representanteData.email || '';
    document.getElementById('rep-cpf').value = representanteData.cpf || '';
    document.getElementById('rep-dob').value = representanteData.dataNascimento || '';
    document.getElementById('rep-phone').value = representanteData.telefone || '';
    document.getElementById('rep-cargo').value = representanteData.cargo || '';
}

// --- MÁSCARAS DE INPUT ---
IMask(document.getElementById('ent-cep'), { mask: '00000-000' });
IMask(document.getElementById('rep-dob'), { mask: '00/00/0000' });
IMask(document.getElementById('rep-phone'), { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] });


// --- EVENT LISTENERS ---
editProfileBtn.addEventListener('click', () => toggleEditMode(true));
cancelEditBtn.addEventListener('click', () => {
    toggleEditMode(false);
    populateForm(originalProfileData.entidadeData, originalProfileData.representanteData); // Restaura dados originais
});

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoadingButton(true);
    saveFeedback.textContent = '';

    try {
        let logoUrl = logoPreview.src; 

        if (croppedImageBlob) {
            const fileName = `logos/logo_${currentUserSession.auth.uid}.webp`;
            const fileRef = storageRef(storage, fileName);
            await uploadBytes(fileRef, croppedImageBlob);
            logoUrl = await getDownloadURL(fileRef);
        }

        const batch = writeBatch(db);
        const uid = currentUserSession.auth.uid;

        const entidadeDocRef = doc(db, paths.entidadeDoc(uid));
        batch.update(entidadeDocRef, {
            'dadosEntidade.nomeFantasia': document.getElementById('ent-nome-fantasia').value,
            'dadosEntidade.descricao': document.getElementById('ent-descricao').value,
            'dadosEntidade.endereco.cep': document.getElementById('ent-cep').value,
            'dadosEntidade.endereco.rua': document.getElementById('ent-rua').value,
            'dadosEntidade.endereco.numero': document.getElementById('ent-numero').value,
            'dadosEntidade.endereco.bairro': document.getElementById('ent-bairro').value,
            logoUrl: logoUrl,
        });
        
        const representanteDocRef = doc(db, paths.representanteDoc(uid, uid));
        batch.update(representanteDocRef, {
            nomeCompleto: document.getElementById('rep-name').value,
            dataNascimento: document.getElementById('rep-dob').value,
            telefone: document.getElementById('rep-phone').value,
            cargo: document.getElementById('rep-cargo').value,
        });

        await batch.commit();

        showSaveFeedback('Perfil atualizado com sucesso!', 'success');
        await loadProfileData(uid, true); // Força o recarregamento dos dados para atualizar a variável `originalProfileData`
        toggleEditMode(false); // Volta para o modo de visualização
        await injectHeader();
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        showSaveFeedback('Erro ao salvar. Tente novamente.', 'error');
    } finally {
        showLoadingButton(false);
        croppedImageBlob = null;
    }
});


// --- LÓGICA DO CROPPER DE IMAGEM ---
logoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        imageToCrop.src = event.target.result;
        cropperModal.classList.remove('hidden');
        if (cropper) cropper.destroy();
        cropper = new Cropper(imageToCrop, { 
            aspectRatio: 1, 
            viewMode: 1,
            background: false,
            autoCropArea: 1
        });
    };
    reader.readAsDataURL(file);
    logoUploadInput.value = '';
});

cancelCropBtn.addEventListener('click', () => cropperModal.classList.add('hidden'));

confirmCropBtn.addEventListener('click', () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: 'high' });
    canvas.toBlob((blob) => {
        croppedImageBlob = blob;
        logoPreview.src = URL.createObjectURL(blob);
        cropperModal.classList.add('hidden');
        // Entra no modo de edição automaticamente ao escolher uma nova foto
        toggleEditMode(true);
    }, 'image/webp', 0.9);
});

// --- FUNÇÕES AUXILIARES ---
function showLoadingButton(isLoading) {
    saveBtnText.classList.toggle('hidden', isLoading);
    saveBtnSpinner.classList.toggle('hidden', !isLoading);
    saveBtn.disabled = isLoading;
}

function showSaveFeedback(message, type = 'success') {
    saveFeedback.textContent = message;
    saveFeedback.className = `text-sm mr-4 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    setTimeout(() => { saveFeedback.textContent = ''; }, 4000);
}

// --- INICIAR A APLICAÇÃO ---
initializeApp();
