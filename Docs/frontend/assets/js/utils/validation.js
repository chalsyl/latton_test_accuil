const ValidationUtils = {
    // Règles de validation
    rules: {
        // Validation d'email
        email: {
            test: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: 'Adresse email invalide'
        },

        // Validation de la longueur minimale
        minLength: (min) => ({
            test: (value) => value.length >= min,
            message: `Minimum ${min} caractères requis`
        }),

        // Validation de la longueur maximale
        maxLength: (max) => ({
            test: (value) => value.length <= max,
            message: `Maximum ${max} caractères autorisés`
        }),

        // Validation du mot de passe
        password: {
            test: (value) => {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return passwordRegex.test(value);
            },
            message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
        },

        // Validation des caractères autorisés pour le nom d'utilisateur
        username: {
            test: (value) => {
                const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
                return usernameRegex.test(value);
            },
            message: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, - et _)'
        },

        // Champ requis
        required: {
            test: (value) => value.trim().length > 0,
            message: 'Ce champ est requis'
        },

        // Validation numérique
        numeric: {
            test: (value) => !isNaN(value) && value.toString().trim().length > 0,
            message: 'Ce champ doit être un nombre'
        },

        // Validation d'URL
        url: {
            test: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'URL invalide'
        }
    },

    // Validation d'un champ unique
    validateField(value, rules = []) {
        for (const rule of rules) {
            let validator;
            let params;

            if (typeof rule === 'string') {
                validator = this.rules[rule];
                params = [];
            } else if (typeof rule === 'object') {
                validator = this.rules[rule.type];
                params = rule.params || [];
            }

            if (validator) {
                const validatorFn = typeof validator === 'function' ? 
                    validator(...params) : validator;

                if (!validatorFn.test(value)) {
                    return {
                        isValid: false,
                        message: validatorFn.message
                    };
                }
            }
        }

        return { isValid: true };
    },

    // Validation d'un formulaire complet
    validateForm(formData, validationRules) {
        const errors = {};
        
        Object.keys(validationRules).forEach(fieldName => {
            const value = formData[fieldName];
            const fieldRules = validationRules[fieldName];
            
            const validation = this.validateField(value, fieldRules);
            if (!validation.isValid) {
                errors[fieldName] = validation.message;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Validation en temps réel des champs
    setupLiveValidation(form, validationRules) {
        Object.keys(validationRules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => {
                    const validation = this.validateField(field.value, validationRules[fieldName]);
                    this.showFieldValidation(field, validation);
                });
            }
        });
    },

    // Affichage des erreurs de validation
    showFieldValidation(field, validation) {
        const errorElement = field.nextElementSibling?.classList.contains('validation-error')
            ? field.nextElementSibling
            : document.createElement('div');

        errorElement.className = 'validation-error';

        if (!validation.isValid) {
            errorElement.textContent = validation.message;
            field.classList.add('is-invalid');
            if (!field.nextElementSibling?.classList.contains('validation-error')) {
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        } else {
            field.classList.remove('is-invalid');
            errorElement.remove();
        }
    }
};

// Exportation pour utilisation dans d'autres modules
window.ValidationUtils = ValidationUtils;