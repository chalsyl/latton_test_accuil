const Forms = {
    // Initialisation
    init() {
        this.initValidation();
        this.initPasswordToggles();
        this.initFileUploads();
    },

    // Initialisation de la validation
    initValidation() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Validation en temps réel
            form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            });
        });
    },

    // Gestion de la soumission du formulaire
    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Vérifier si le formulaire est en cours de soumission
        if (form.hasAttribute('data-submitting')) return;

        // Valider tous les champs
        const isValid = this.validateForm(form);
        if (!isValid) return;

        // Ajouter l'indicateur de soumission
        form.setAttribute('data-submitting', 'true');
        this.showLoading(form);

        try {
            // Récupérer les données du formulaire
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Récupérer l'action du formulaire
            const action = form.getAttribute('data-action');
            if (!action) throw new Error('Action de formulaire non spécifiée');

            // Appeler la fonction correspondante
            const response = await this.submitForm(action, data);

            // Gérer la réponse
            if (response.success) {
                this.handleSuccess(form, response);
            } else {
                this.handleError(form, response.error);
            }
        } catch (error) {
            this.handleError(form, error.message);
        } finally {
            // Nettoyer
            form.removeAttribute('data-submitting');
            this.hideLoading(form);
        }
    },

    // Validation d'un champ
    validateField(field) {
        const value = field.value.trim();
        const rules = field.getAttribute('data-rules');
        if (!rules) return true;

        const validations = rules.split('|');
        for (const validation of validations) {
            const [rule, param] = validation.split(':');
            
            switch (rule) {
                case 'required':
                    if (!value) {
                        this.showFieldError(field, 'Ce champ est requis');
                        return false;
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                        this.showFieldError(field, 'Email invalide');
                        return false;
                    }
                    break;

                case 'min':
                    if (value.length < parseInt(param)) {
                        this.showFieldError(field, `Minimum ${param} caractères`);
                        return false;
                    }
                    break;

                case 'max':
                    if (value.length > parseInt(param)) {
                        this.showFieldError(field, `Maximum ${param} caractères`);
                        return false;
                    }
                    break;

                case 'match':
                    const matchField = document.getElementById(param);
                    if (matchField && value !== matchField.value) {
                        this.showFieldError(field, 'Les valeurs ne correspondent pas');
                        return false;
                    }
                    break;
            }
        }

        this.clearFieldError(field);
        return true;
    },

    // Validation du formulaire entier
    validateForm(form) {
        let isValid = true;
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!this.validateField(field)) isValid = false;
        });
        return isValid;
    },

    // Affichage des erreurs de champ
    showFieldError(field, message) {
        const errorDiv = field.nextElementSibling?.classList.contains('field-error')
            ? field.nextElementSibling
            : document.createElement('div');
        
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        if (!field.nextElementSibling?.classList.contains('field-error')) {
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        
        field.classList.add('is-invalid');
    },

    // Suppression des erreurs de champ
    clearFieldError(field) {
        const errorDiv = field.nextElementSibling;
        if (errorDiv?.classList.contains('field-error')) {
            errorDiv.remove();
        }
        field.classList.remove('is-invalid');
    },

    // Gestion des toggles de mot de passe
    initPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggle.querySelector('i').classList.toggle('fa-eye');
                toggle.querySelector('i').classList.toggle('fa-eye-slash');
            });
        });
    },

    // Gestion des uploads de fichiers
    initFileUploads() {
        document.querySelectorAll('input[type="file"]').forEach(input => {
            const label = input.nextElementSibling;
            input.addEventListener('change', () => {
                if (input.files.length > 0) {
                    label.textContent = input.files[0].name;
                }
            });
        });
    },

    // Affichage du chargement
    showLoading(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        }
    },

    // Masquage du chargement
    hideLoading(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Envoyer';
        }
    },

    // Soumission du formulaire
    async submitForm(action, data) {
        // Implémenter la logique de soumission selon l'action
        switch (action) {
            case 'login':
                return await AuthService.login(data);
            case 'register':
                return await AuthService.register(data);
            // Ajouter d'autres cas selon les besoins
            default:
                throw new Error('Action non supportée');
        }
    },

    // Gestion du succès
    handleSuccess(form, response) {
        form.reset();
        NotificationComponent.show(response.message || 'Opération réussie', 'success');
        
        // Déclencher l'événement de succès
        form.dispatchEvent(new CustomEvent('form:success', { detail: response }));
    },

    // Gestion des erreurs
    handleError(form, error) {
        const errorDiv = form.querySelector('.form-error') || document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = error;
        
        if (!form.querySelector('.form-error')) {
            form.insertBefore(errorDiv, form.firstChild);
        }

        // Déclencher l'événement d'erreur
        form.dispatchEvent(new CustomEvent('form:error', { detail: error }));
    }
};

// Exportation pour utilisation dans d'autres modules
window.Forms = Forms;