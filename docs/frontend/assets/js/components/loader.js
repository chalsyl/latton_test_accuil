const Loader = {
    // Création du loader
    create() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `
            <div class="loader-spinner">
                <div class="spinner"></div>
            </div>
            <div class="loader-text">Chargement...</div>
        `;
        return loader;
    },

    // Affichage du loader
    show(container = document.body, message = 'Chargement...') {
        // Supprimer le loader existant s'il y en a un
        this.hide(container);

        const loader = this.create();
        loader.querySelector('.loader-text').textContent = message;

        // Ajouter la classe de position si le conteneur est le body
        if (container === document.body) {
            loader.classList.add('loader-fixed');
        } else {
            container.style.position = 'relative';
            loader.classList.add('loader-absolute');
        }

        container.appendChild(loader);
        container.classList.add('loading');

        // Animation d'entrée
        requestAnimationFrame(() => {
            loader.classList.add('loader-visible');
        });
    },

    // Masquage du loader
    hide(container = document.body) {
        const loader = container.querySelector('.loader');
        if (!loader) return;

        // Animation de sortie
        loader.classList.remove('loader-visible');
        
        // Suppression après l'animation
        loader.addEventListener('transitionend', () => {
            loader.remove();
            container.classList.remove('loading');
            
            // Restaurer le style de position si nécessaire
            if (container !== document.body) {
                container.style.position = '';
            }
        }, { once: true });
    },

    // Loader pour les boutons
    showButtonLoader(button, message = 'Chargement...') {
        // Sauvegarder le contenu original
        button.setAttribute('data-original-content', button.innerHTML);
        
        // Désactiver le bouton
        button.disabled = true;
        
        // Ajouter le loader
        button.innerHTML = `
            <span class="button-loader">
                <i class="fas fa-spinner fa-spin"></i>
                <span>${message}</span>
            </span>
        `;
    },

    // Restaurer le bouton
    hideButtonLoader(button) {
        const originalContent = button.getAttribute('data-original-content');
        if (originalContent) {
            button.innerHTML = originalContent;
            button.removeAttribute('data-original-content');
        }
        button.disabled = false;
    },

    // Loader pour les sections
    showSectionLoader(section, message = 'Chargement...') {
        section.innerHTML = `
            <div class="section-loader">
                <div class="spinner"></div>
                <div class="loader-text">${message}</div>
            </div>
        `;
    },

    // Mise à jour du message du loader
    updateMessage(container = document.body, message) {
        const loader = container.querySelector('.loader');
        if (loader) {
            const textElement = loader.querySelector('.loader-text');
            if (textElement) {
                textElement.textContent = message;
            }
        }
    }
};

// Exportation pour utilisation dans d'autres modules
window.Loader = Loader;

// Styles CSS associés (à ajouter dans un fichier CSS)
const loaderStyles = `
    .loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    }

    .loader-fixed {
        position: fixed;
    }

    .loader-absolute {
        position: absolute;
    }

    .loader-visible {
        opacity: 1;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loader-text {
        margin-top: var(--spacing-md);
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .button-loader {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .section-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
    }
`;

// Ajout des styles au document
const styleSheet = document.createElement('style');
styleSheet.textContent = loaderStyles;
document.head.appendChild(styleSheet);