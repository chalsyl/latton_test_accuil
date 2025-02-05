class ForumPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentCategory = '';
        this.currentSort = 'activity';
        this.forumsContainer = document.querySelector('.forums-container');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.sortSelect = document.getElementById('sortSelect');
        this.createForumBtn = document.getElementById('createForumBtn');
        this.pagination = document.getElementById('pagination');
    }

    // Initialisation
    async init() {
        this.bindEvents();
        this.checkPermissions();
        await this.loadForums();
        Loader.hide();
    }

    // Liaison des événements
    bindEvents() {
        this.categoryFilter?.addEventListener('change', () => {
            this.currentCategory = this.categoryFilter.value;
            this.currentPage = 1;
            this.loadForums();
        });

        this.sortSelect?.addEventListener('change', () => {
            this.currentSort = this.sortSelect.value;
            this.loadForums();
        });

        this.createForumBtn?.addEventListener('click', () => {
            this.showCreateForumModal();
        });
    }

    // Vérification des permissions
    checkPermissions() {
        if (this.createForumBtn) {
            this.createForumBtn.style.display = 
                App.hasPermission('create_forum') ? 'block' : 'none';
        }
    }

    // Chargement des forums
    async loadForums() {
        try {
            Loader.show(this.forumsContainer);

            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                category: this.currentCategory,
                sort: this.currentSort
            };

            const response = await ForumService.getForums(params);
            this.renderForums(response.data);
            this.renderPagination(response.pagination);
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement des forums', 'error');
            console.error(error);
        } finally {
            Loader.hide(this.forumsContainer);
        }
    }

    // Rendu des forums
    renderForums(forums) {
        if (!this.forumsContainer) return;

        if (forums.length === 0) {
            this.forumsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>Aucun forum trouvé</h3>
                    <p>Il n'y a pas encore de forum dans cette catégorie.</p>
                </div>
            `;
            return;
        }

        this.forumsContainer.innerHTML = forums.map(forum => this.renderForumCard(forum)).join('');
    }

    // Rendu d'une carte de forum
    renderForumCard(forum) {
        return `
            <div class="forum-item">
                <div class="forum-header">
                    <a href="/forum/${forum._id}" class="forum-title">${forum.title}</a>
                    <span class="forum-category">${forum.category}</span>
                </div>
                <p class="forum-description">${forum.description}</p>
                <div class="forum-stats">
                    <div class="stat-item">
                        <i class="fas fa-comments"></i>
                        <span>${Helpers.formatNumber(forum.postsCount)} posts</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${Helpers.formatNumber(forum.subscribersCount)} abonnés</span>
                    </div>
                </div>
                ${forum.lastPost ? this.renderLastPost(forum.lastPost) : ''}
            </div>
        `;
    }

    // Rendu du dernier post
    renderLastPost(lastPost) {
        return `
            <div class="forum-activity">
                <div class="last-post">
                    <img src="${lastPost.author.avatar || '../assets/images/default-avatar.png'}" 
                         class="last-post-avatar" 
                         alt="Avatar">
                    <div>
                        <span>Dernier message par 
                            <a href="/profile/${lastPost.author._id}">${lastPost.author.username}</a>
                        </span>
                        <span>${Helpers.formatDate(lastPost.createdAt, 'relative')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Rendu de la pagination
    renderPagination(pagination) {
        if (!this.pagination) return;

        const pages = [];
        for (let i = 1; i <= pagination.pages; i++) {
            pages.push(`
                <button class="pagination-btn ${i === pagination.page ? 'active' : ''}"
                        data-page="${i}">
                    ${i}
                </button>
            `);
        }

        this.pagination.innerHTML = pages.join('');
        this.bindPaginationEvents();
    }

    // Liaison des événements de pagination
    bindPaginationEvents() {
        this.pagination.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.dataset.page);
                this.loadForums();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Affichage de la modale de création de forum
    showCreateForumModal() {
        const modal = Modal.create({
            id: 'createForumModal',
            title: 'Créer un nouveau forum',
            content: this.getCreateForumForm(),
            buttons: [
                {
                    text: 'Annuler',
                    class: 'btn-secondary',
                    action: 'cancel',
                    closeModal: true
                },
                {
                    text: 'Créer',
                    class: 'btn-primary',
                    action: 'create',
                    closeModal: false
                }
            ]
        });

        // Initialiser la validation du formulaire
        const form = modal.querySelector('#createForumForm');
        form.addEventListener('submit', (e) => this.handleCreateForum(e));
    }

    // Récupération du formulaire de création
    getCreateForumForm() {
        return `
            <form id="createForumForm">
                <div class="form-group">
                    <label for="forumTitle">Titre</label>
                    <input type="text" id="forumTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="forumDescription">Description</label>
                    <textarea id="forumDescription" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="forumCategory">Catégorie</label>
                    <select id="forumCategory" name="category" required>
                        <option value="">Sélectionner une catégorie</option>
                        <option value="general">Général</option>
                        <option value="technology">Technologie</option>
                        <option value="gaming">Jeux vidéo</option>
                        <option value="sports">Sports</option>
                        <option value="entertainment">Divertissement</option>
                        <option value="education">Éducation</option>
                        <option value="other">Autre</option>
                    </select>
                </div>
            </form>
        `;
    }

    // Gestion de la création d'un forum
    async handleCreateForum(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            Loader.showButtonLoader(form.querySelector('button[type="submit"]'));
            const response = await ForumService.createForum(data);
            
            NotificationComponent.show('Forum créé avec succès', 'success');
            Modal.close('createForumModal');
            await this.loadForums();
        } catch (error) {
            NotificationComponent.show(error.message, 'error');
        } finally {
            Loader.hideButtonLoader(form.querySelector('button[type="submit"]'));
        }
    }
}

// Initialisation de la page au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    const forumPage = new ForumPage();
    forumPage.init();
});