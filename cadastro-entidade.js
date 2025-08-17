import { auth, db, paths } from './app-config.js';
import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    doc, 
    setDoc, 
    writeBatch,
    serverTimestamp 
} from './firebase-services.js';
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
    nextBtn.classList.toggle('w-full', currentStep === 0);
};

const setButtonLoading = (isLoading) => {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnSpinner.classList.toggle('hidden', !isLoading);
};

const validateStep = (stepIndex) => {
    const inputs = steps[stepIndex].querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
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

    if (stepIndex === 0) {
        const emailInput = document.getElementById('rep-email');
        const emailError = document.getElementById('rep-email-error');
        const passwordInput = document.getElementById('rep-password');
        const passwordConfirmInput = document.getElementById('rep-password-confirm');
        const passwordError = document.getElementById('rep-password-error');
        const passwordConfirmError = document.getElementById('rep-password-confirm-error');

        if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.classList.add('input-error');
            emailError.textContent = "Por favor, insira um e-mail válido.";
            emailError.classList.remove('hidden');
            isValid = false;
        }
        if (passwordInput.value && passwordInput.value.length < 6) {
            passwordInput.classList.add('input-error');
            passwordError.textContent = "A senha deve ter no mínimo 6 caracteres.";
            passwordError.classList.remove('hidden');
            isValid = false;
        }
         if (passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmInput.classList.add('input-error');
            passwordConfirmError.textContent = "As senhas não coincidem.";
            passwordConfirmError.classList.remove('hidden');
            isValid = false;
        }
    }
    
    if (stepIndex === 2) {
        if (!document.getElementById('terms-agree').checked) {
            errorDiv.textContent = "Você precisa aceitar os Termos para continuar.";
            errorDiv.classList.remove('hidden');
            isValid = false;
        } else if (isValid) {
            errorDiv.classList.add('hidden');
        }
    }
    return isValid;
};

nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        updateUI();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateUI();
});

document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
        const inputId = button.dataset.togglePassword;
        const input = document.getElementById(inputId);
        const icon = button.querySelector('svg');
        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.56-5.448 6.804-6.304M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.582 17.582A10.012 10.012 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.56-5.448 6.804-6.304m.02-3.65A12.01 12.01 0 0112 5c4.478 0 8.268 2.943 9.542 7a12.01 12.01 0 01-2.008 3.934M1 1l22 22"></path>`;
        } else {
            input.type = 'password';
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
        }
    });
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const allInputs = signupForm.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value;
        }
    });

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
        errorDiv.textContent = "Por favor, preencha todos os campos obrigatórios corretamente.";
        errorDiv.classList.remove('hidden');
        return;
    };

    setButtonLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData['rep-email'], formData['rep-password']);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData['rep-name'] });
        
        const batch = writeBatch(db);

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
        await sendEmailVerification(user); // Enviar e-mail após salvar no banco com sucesso
        
        window.location.href = 'aguardando-aprovacao.html';

    } catch (error) {
        console.error("Erro detalhado ao salvar:", error);

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
