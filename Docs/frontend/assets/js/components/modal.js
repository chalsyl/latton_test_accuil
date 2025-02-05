const Modal = {
    // État des modales
    activeModals: [],

    // Initialisation
    init() {
        this.bindEvents();
        this.setupCloseHandlers();
    },

    // Liaison des événements
    bindEvents() {
        // Gestion des clics sur les boutons d'ouverture de modale
        document.querySelectorAll('[data-modal-target]').forEach(button => {
            button.addEventListener('click', (e) => {
                const modalId = button.getAttribute('data-modal-target');
                this.open(modalId);
            });
        });
    },

    // Configuration des gestionnaires de fermeture
    setupCloseHandlers() {
        // Fermeture par bouton
        document.querySelectorAll('[data-close-modal]').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.close(modal.id);
            });
        });

        // Fermeture par clic sur l'arrière-plan
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(modal.id);
            });
        });

        // Fermeture par touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                this.close(this.activeModals[this.activeModals.length - 1]);
            }
        });
    },

    // Ouverture d'une modale
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Empêcher le défilement de la page
        document.body.style.overflow = 'hidden';

        // Ajouter la classe active
        modal.classList.add('active');

        // Ajouter à la pile des modales actives
        this.activeModals.push(modalId);

        // Focus sur le premier élément focusable
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
        if (firstFocusable) firstFocusable.focus();

        // Déclencher l'événement d'ouverture
        modal.dispatchEvent(new CustomEvent('modal:open'));
    },

    // Fermeture d'une modale
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Retirer la classe active
        modal.classList.remove('active');

        // Retirer de la pile des modales actives
        this.activeModals = this.activeModals.filter(id => id !== modalId);

        // Restaurer le défilement si aucune modale n'est active
        if (this.activeModals.length === 0) {
            document.body.style.overflow = '';
        }

        // Déclencher l'événement de fermeture
        modal.dispatchEvent(new CustomEvent('modal:close'));
    },

    // Création dynamique d'une modale
    create({id, title, content, buttons = []}) {
        const modalHtml = `
            <div class="modal" id="${id}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button type="button" class="modal-close" data-close-modal>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${buttons.length > 0 ? `
                        <div class="modal-footer">
                            ${buttons.map(btn => `
                                <button type="button" 
                                        class="btn ${btn.class || ''}"
                                        data-action="${btn.action}">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById(id);

        // Ajouter les gestionnaires d'événements pour les boutons
        buttons.forEach(btn => {
            modal.querySelector(`[data-action="${btn.action}"]`)?.addEventListener('click', (e) => {
                if (btn.callback) btn.callback(e);
                if (btn.closeModal) this.close(id);
            });
        });

        this.setupCloseHandlers();
        return modal;
    },

    // Mise à jour du contenu d'une modale
    update(modalId, content) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) modalBody.innerHTML = content;
    }
};

// Exportation pour utilisation dans d'autres modules
window.Modal = Modal;