import { auth, db, paths } from './app-config.js';
// --- INÍCIO DA CORREÇÃO: Importando 'serverTimestamp' do local correto ---
import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    doc, 
    setDoc, 
    writeBatch,
    serverTimestamp // Movido para cá
} from './firebase-services.js';
// --- FIM DA CORREÇÃO ---
import { injectHeader } from './app-header.js';

injectHeader();

const steps = [document.getElementById('step-1'), document.getElementById('step-2'), document.getElementById('step-3')];
const indicators = [document.getElementById('step-1-indicator'), document.getElementById('step-2-indicator'), document.getElementById('step-3-indicator')];
const lines = [document.getElementById('step-line-1'), document.getElementById('step-line-2')];

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const signupForm = document.getElementById('signup-form');
const errorDiv = document.getElementById('signup-error');

let currentStep = 0;
const formData = {};

// --- Máscaras de Input ---
IMask(document.getElementById('rep-cpf'), { mask: '000.000.000-00' });
IMask(document.getElementById('ent-cnpj'), { mask: '00.000.000/0000-00' });
IMask(document.getElementById('rep-phone'), { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] });
IMask(document.getElementById('ent-cep'), { mask: '00000-000' });


const updateUI = () => {
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index !== currentStep);
    });

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('step-active', index <= currentStep);
        indicator.classList.toggle('step-inactive', index > currentStep);
    });
    
    lines.forEach((line, index) => {
        line.classList.toggle('step-line-active', index < currentStep);
    });

    prevBtn.classList.toggle('hidden', currentStep === 0);
    nextBtn.classList.toggle('hidden', currentStep === 2);
    submitBtn.classList.toggle('hidden', currentStep !== 2);
    
    if (currentStep > 0) {
        nextBtn.classList.remove('w-full');
    } else {
        nextBtn.classList.add('w-full');
    }
};

const validateStep = (stepIndex) => {
    const inputs = steps[stepIndex].querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    // Limpa erros antigos da etapa atual
    steps[stepIndex].querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));

    inputs.forEach(input => {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (!input.value.trim()) {
            input.classList.add('input-error');
            if (errorEl) {
                errorEl.textContent = "Este campo é obrigatório.";
                errorEl.classList.remove('hidden');
            }
            isValid = false;
        } else {
             input.classList.remove('input-error');
             input.classList.add('input-success');
        }
    });

    // Validações específicas da etapa 1
    if (stepIndex === 0) {
        const emailInput = document.getElementById('rep-email');
        const emailError = document.getElementById('rep-email-error');
        const password = document.getElementById('rep-password').value;
        const passwordConfirm = document.getElementById('rep-password-confirm').value;
        const passwordInput = document.getElementById('rep-password');
        const passwordConfirmInput = document.getElementById('rep-password-confirm');
        const passwordError = document.getElementById('rep-password-error');
        const passwordConfirmError = document.getElementById('rep-password-confirm-error');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.classList.add('input-error');
            emailError.textContent = "Por favor, insira um e-mail válido.";
            emailError.classList.remove('hidden');
            isValid = false;
        }

        if (password.length < 6) {
            passwordInput.classList.add('input-error');
            passwordError.textContent = "A senha deve ter no mínimo 6 caracteres.";
            passwordError.classList.remove('hidden');
            isValid = false;
        }
         if (password !== passwordConfirm) {
            passwordConfirmInput.classList.add('input-error');
            passwordConfirmError.textContent = "As senhas não coincidem.";
            passwordConfirmError.classList.remove('hidden');
            isValid = false;
        }
    }
    
     // Validações específicas da etapa 3
    if (stepIndex === 2) {
        if (!document.getElementById('terms-agree').checked) {
            errorDiv.textContent = "Você precisa aceitar os Termos para continuar.";
            errorDiv.classList.remove('hidden');
            isValid = false;
        }
    }

    if(isValid) errorDiv.classList.add('hidden');

    return isValid;
};

nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        // Salva dados da etapa atual
        const inputs = steps[currentStep].querySelectorAll('input, textarea');
        inputs.forEach(input => formData[input.id] = input.value);

        currentStep++;
        updateUI();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateUI();
});

const setButtonLoading = (isLoading) => {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnSpinner.classList.toggle('hidden', !isLoading);
};


signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
     // Salva os dados da última etapa antes de submeter
    const inputs = steps[currentStep].querySelectorAll('input, textarea, input[type=checkbox]');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value;
        }
    });

    if (!validateStep(2)) return;

    setButtonLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData['rep-email'], formData['rep-password']);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData['rep-name'] });
        await sendEmailVerification(user);

        const batch = writeBatch(db);

        // 1. Cria o documento da Entidade
        const entidadeDocRef = doc(db, paths.entidadeDoc(user.uid));
        batch.set(entidadeDocRef, {
            dadosEntidade: {
                razaoSocial: formData['ent-razao-social'],
                nomeFantasia: formData['ent-nome-fantasia'],
                cnpj: formData['ent-cnpj'],
                descricao: formData['ent-descricao'],
                endereco: {
                    cep: formData['ent-cep'],
                    rua: formData['ent-rua'],
                    numero: formData['ent-numero'],
                    bairro: formData['ent-bairro'],
                }
            },
            role: 'entidade',
            status: 'pendente',
            criadoEm: serverTimestamp()
        });

        // 2. Cria o documento do primeiro Representante na subcoleção
        const representanteDocRef = doc(db, paths.representanteDoc(user.uid, user.uid));
        batch.set(representanteDocRef, {
            nomeCompleto: formData['rep-name'],
            cpf: formData['rep-cpf'],
            email: formData['rep-email'],
            telefone: formData['rep-phone'],
            cargo: formData['rep-cargo'],
            isPrincipal: true
        });

        await batch.commit();
        
        window.location.href = 'aguardando-aprovacao.html';

    } catch (error) {
        const traduzErroFirebase = (code) => {
            const erros = {
                'auth/email-already-in-use': 'Este e-mail já está a ser utilizado.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/weak-password': 'A senha é muito fraca.'
            };
            return erros[code] || 'Ocorreu um erro. Tente novamente mais tarde.';
        };
        errorDiv.textContent = traduzErroFirebase(error.code);
        errorDiv.classList.remove('hidden');
        setButtonLoading(false);
    }
});

updateUI();
