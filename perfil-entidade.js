import { db, storage, paths } from './app-config.js';
import { doc, getDoc, updateDoc, writeBatch, storageRef, uploadBytes, getDownloadURL } from './firebase-services.js';
import { injectHeader } from './app-header.js';
import { getCurrentUser } from './auth-service.js';

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

let currentUserSession = null;
let cropper;
let croppedImageBlob = null;

// --- INICIALIZAÇÃO ---
async function initializeApp() {
    await injectHeader();
    currentUserSession = await getCurrentUser();

    if (currentUserSession && currentUserSession.profile?.role === 'entidade') {
        loadProfileData(currentUserSession.auth.uid);
    } else {
        window.location.href = 'login.html';
    }
}

// --- CARREGAMENTO DE DADOS ---
async function loadProfileData(uid) {
    try {
        const entidadeDocRef = doc(db, paths.entidadeDoc(uid));
        const representanteDocRef = doc(db, paths.representanteDoc(uid, uid));

        const [entidadeSnap, representanteSnap] = await Promise.all([
            getDoc(entidadeDocRef),
            getDoc(representanteDocRef)
        ]);

        if (!entidadeSnap.exists() || !representanteSnap.exists()) {
            throw new Error("Dados do perfil não encontrados.");
        }

        const entidadeData = entidadeSnap.data();
        const representanteData = representanteSnap.data();

        // Preencher cabeçalho e logo
        document.getElementById('entity-name-display').textContent = entidadeData.dadosEntidade.nomeFantasia || 'Nome não definido';
        document.getElementById('entity-email-display').textContent = representanteData.email || '';
        logoPreview.src = entidadeData.logoUrl || 'https://placehold.co/128x128/e2e8f0/cbd5e0?text=Logo';

        // Preencher formulário - Seção Entidade
        document.getElementById('ent-nome-fantasia').value = entidadeData.dadosEntidade.nomeFantasia || '';
        document.getElementById('ent-razao-social').value = entidadeData.dadosEntidade.razaoSocial || '';
        document.getElementById('ent-cnpj').value = entidadeData.dadosEntidade.cnpj || '';
        document.getElementById('ent-descricao').value = entidadeData.dadosEntidade.descricao || '';
        document.getElementById('ent-cep').value = entidadeData.dadosEntidade.endereco?.cep || '';
        document.getElementById('ent-rua').value = entidadeData.dadosEntidade.endereco?.rua || '';
        document.getElementById('ent-numero').value = entidadeData.dadosEntidade.endereco?.numero || '';
        document.getElementById('ent-bairro').value = entidadeData.dadosEntidade.endereco?.bairro || '';

        // Preencher formulário - Seção Representante
        document.getElementById('rep-name').value = representanteData.nomeCompleto || '';
        document.getElementById('rep-email').value = representanteData.email || '';
        document.getElementById('rep-cpf').value = representanteData.cpf || '';
        document.getElementById('rep-dob').value = representanteData.dataNascimento || '';
        document.getElementById('rep-phone').value = representanteData.telefone || '';
        document.getElementById('rep-cargo').value = representanteData.cargo || '';
        
        loadingView.classList.add('hidden');
        profileView.classList.remove('hidden');

    } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        loadingView.innerHTML = `<p class="text-red-500">Não foi possível carregar os dados do perfil.</p>`;
    }
}

// --- MÁSCARAS DE INPUT ---
IMask(document.getElementById('ent-cep'), { mask: '00000-000' });
IMask(document.getElementById('rep-dob'), { mask: '00/00/0000' });
IMask(document.getElementById('rep-phone'), { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] });


// --- SALVAMENTO DE DADOS ---
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoadingButton(true);
    saveFeedback.textContent = '';

    try {
        let logoUrl = currentUserSession.profile.logoUrl; // Mantém a URL atual por padrão

        // 1. Upload do novo logo, se houver
        if (croppedImageBlob) {
            const fileName = `logos/logo_${currentUserSession.auth.uid}.webp`;
            const fileRef = storageRef(storage, fileName);
            await uploadBytes(fileRef, croppedImageBlob);
            logoUrl = await getDownloadURL(fileRef);
        }

        const batch = writeBatch(db);
        const uid = currentUserSession.auth.uid;

        // 2. Preparar dados para o documento da Entidade
        const entidadeDocRef = doc(db, paths.entidadeDoc(uid));
        const entidadeDataToUpdate = {
            'dadosEntidade.nomeFantasia': document.getElementById('ent-nome-fantasia').value,
            'dadosEntidade.descricao': document.getElementById('ent-descricao').value,
            'dadosEntidade.endereco.cep': document.getElementById('ent-cep').value,
            'dadosEntidade.endereco.rua': document.getElementById('ent-rua').value,
            'dadosEntidade.endereco.numero': document.getElementById('ent-numero').value,
            'dadosEntidade.endereco.bairro': document.getElementById('ent-bairro').value,
            logoUrl: logoUrl,
        };
        batch.update(entidadeDocRef, entidadeDataToUpdate);
        
        // 3. Preparar dados para o documento do Representante
        const representanteDocRef = doc(db, paths.representanteDoc(uid, uid));
        const representanteDataToUpdate = {
            nomeCompleto: document.getElementById('rep-name').value,
            dataNascimento: document.getElementById('rep-dob').value,
            telefone: document.getElementById('rep-phone').value,
            cargo: document.getElementById('rep-cargo').value,
        };
        batch.update(representanteDocRef, representanteDataToUpdate);

        // 4. Cometer as atualizações
        await batch.commit();

        // 5. Atualizar UI
        showSaveFeedback('Perfil atualizado com sucesso!', 'success');
        if (croppedImageBlob) logoPreview.src = logoUrl; // Apenas atualiza a imagem se uma nova foi enviada
        document.getElementById('entity-name-display').textContent = entidadeDataToUpdate['dadosEntidade.nomeFantasia'];
        await injectHeader(); // Recarrega o cabeçalho para refletir o novo nome, se necessário
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        showSaveFeedback('Erro ao salvar. Tente novamente.', 'error');
    } finally {
        showLoadingButton(false);
        croppedImageBlob = null; // Reseta o blob após o envio
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
        cropper = new Cropper(imageToCrop, { aspectRatio: 1, viewMode: 1 });
    };
    reader.readAsDataURL(file);
    logoUploadInput.value = '';
});

cancelCropBtn.addEventListener('click', () => cropperModal.classList.add('hidden'));

confirmCropBtn.addEventListener('click', () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 256, height: 256 });
    canvas.toBlob((blob) => {
        croppedImageBlob = blob;
        logoPreview.src = URL.createObjectURL(blob);
        cropperModal.classList.add('hidden');
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
