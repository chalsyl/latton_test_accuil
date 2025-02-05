class ProfilePage {
    constructor() {
        this.userId = this.getUserIdFromUrl();
        this.user = null;
        this.activeTab = 'overview';
        this.currentPostsPage = 1;
        this.postsPerPage = 10;

        // Éléments DOM
        this.profileTabs = document.querySelector('.profile-nav');
        this.profileContent = document.querySelector('.profile-content');
        this.avatarUploadBtn = document.getElementById('editAvatarBtn');
        this.settingsForm = document.getElementById('profileSettingsForm');
    }

    // Initialisation
    async init() {
        try {
            await this.loadUserProfile();
            this.bindEvents();
            this.initializeAvatarUpload();
            this.checkPermissions();
            Loader.hide();
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement du profil', 'error');
            console.error(error);
        }
    }

    // Récupération de l'ID utilisateur depuis l'URL
    getUserIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1] === 'profile' ? 
            App.state.currentUser?.id : pathParts[pathParts.length - 1];
    }

    // Chargement du profil utilisateur
    async loadUserProfile() {
        try {
            Loader.show(this.profileContent);
            const response = await ForumService.getUserProfile(this.userId);
            this.user = response.data;
            this.renderProfile();
            await this.loadTabContent(this.activeTab);
        } catch (error) {
            throw error;
        } finally {
            Loader.hide(this.profileContent);
        }
    }

    // Liaison des événements
    bindEvents() {
        // Gestion des onglets
        this.profileTabs?.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.nav-btn');
            if (tabBtn) {
                this.switchTab(tabBtn.dataset.tab);
            }
        });

        // Gestion du formulaire de paramètres
        this.settingsForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsUpdate();
        });
    }

    // Vérification des permissions
    checkPermissions() {
        const isOwnProfile = this.userId === App.state.currentUser?.id;
        
        if (this.avatarUploadBtn) {
            this.avatarUploadBtn.style.display = isOwnProfile ? 'block' : 'none';
        }

        // Cacher l'onglet paramètres si ce n'est pas le profil de l'utilisateur
        const settingsTab = this.profileTabs?.querySelector('[data-tab="settings"]');
        if (settingsTab) {
            settingsTab.style.display = isOwnProfile ? 'block' : 'none';
        }
    }

    // Initialisation de l'upload d'avatar
    initializeAvatarUpload() {
        this.avatarUploadBtn?.addEventListener('click', () => {
            Modal.create({
                id: 'avatarModal',
                title: 'Modifier l\'avatar',
                content: this.getAvatarUploadForm(),
                buttons: [
                    {
                        text: 'Annuler',
                        class: 'btn-secondary',
                        action: 'cancel',
                        closeModal: true
                    },
                    {
                        text: 'Enregistrer',
                        class: 'btn-primary',
                        action: 'save',
                        callback: () => this.handleAvatarUpload()
                    }
                ]
            });

            // Prévisualisation de l'image
            const input = document.getElementById('avatarUpload');
            const preview = document.getElementById('avatarPreview');
            
            input?.addEventListener('change', () => {
                const file = input.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // Rendu du profil
    renderProfile() {
        // Mise à jour du titre de la page
        document.title = `${this.user.username} - Profil`;

        // Mise à jour de l'avatar et du nom d'utilisateur
        document.getElementById('userAvatar').src = this.user.avatar || '../assets/images/default-avatar.png';
        document.getElementById('username').textContent = this.user.username;
        document.getElementById('userRole').textContent = this.user.role;
        document.getElementById('joinDate').textContent = Helpers.formatDate(this.user.createdAt, 'short');

        // Mise à jour des statistiques
        document.getElementById('postCount').textContent = Helpers.formatNumber(this.user.stats.postsCount);
        document.getElementById('likesReceived').textContent = Helpers.formatNumber(this.user.stats.likesReceived);
        document.getElementById('reputation').textContent = Helpers.formatNumber(this.user.stats.reputation);

        // Mise à jour de la bio si elle existe
        const bioElement = document.getElementById('userBio');
        if (bioElement) {
            bioElement.textContent = this.user.bio || 'Aucune bio renseignée';
        }

        // Mise à jour des détails si ils existent
        const locationElement = document.getElementById('location');
        if (locationElement) {
            locationElement.textContent = this.user.location || 'Non renseigné';
        }

        const websiteElement = document.getElementById('website');
        if (websiteElement) {
            websiteElement.textContent = this.user.website || 'Non renseigné';
        }

        // Si c'est le profil de l'utilisateur actuel, pré-remplir le formulaire de paramètres
        if (this.userId === App.state.currentUser?.id) {
            this.populateSettingsForm();
        }
    }
    // Changement d'onglet
    async switchTab(tabName) {
        // Mise à jour des classes actives
        this.profileTabs.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.profileContent.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.toggle('active', tab.id === tabName);
        });

        this.activeTab = tabName;
        await this.loadTabContent(tabName);
    }

    // Chargement du contenu de l'onglet
    async loadTabContent(tabName) {
        switch(tabName) {
            case 'overview':
                await this.loadActivityFeed();
                break;
            case 'posts':
                await this.loadUserPosts();
                break;
            case 'forums':
                await this.loadFollowedForums();
                break;
        }
    }

    // Chargement du flux d'activité
    async loadActivityFeed() {
        try {
            const response = await ForumService.getUserActivity(this.userId);
            this.renderActivityFeed(response.data);
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement de l\'activité', 'error');
        }
    }

    // Rendu du flux d'activité
    renderActivityFeed(activities) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>Aucune activité récente</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        ${this.formatActivityText(activity)}
                        <span class="activity-date">${Helpers.formatDate(activity.createdAt, 'relative')}</span>
                    </div>
                    ${activity.content ? `
                        <div class="activity-preview">
                            ${Helpers.truncateText(activity.content, 150)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Obtention de l'icône d'activité
    getActivityIcon(type) {
        const icons = {
            post: 'fa-pen',
            reply: 'fa-reply',
            like: 'fa-thumbs-up',
            forum_follow: 'fa-bookmark',
            achievement: 'fa-trophy'
        };
        return icons[type] || 'fa-circle';
    }

    // Formatage du texte d'activité
    formatActivityText(activity) {
        const templates = {
            post: 'a créé un nouveau sujet',
            reply: 'a répondu à un sujet',
            like: 'a aimé un message',
            forum_follow: 'suit un nouveau forum',
            achievement: 'a obtenu un succès'
        };

        let text = templates[activity.type] || 'a effectué une action';
        
        if (activity.target) {
            text += ` dans <a href="${activity.target.url}">${activity.target.title}</a>`;
        }

        return text;
    }

    // Chargement des posts de l'utilisateur
    async loadUserPosts() {
        try {
            const postTypeFilter = document.getElementById('postTypeFilter')?.value || 'all';
            const postSortFilter = document.getElementById('postSortFilter')?.value || 'recent';

            const response = await ForumService.getUserPosts(this.userId, {
                page: this.currentPostsPage,
                limit: this.postsPerPage,
                type: postTypeFilter,
                sort: postSortFilter
            });

            this.renderUserPosts(response.data, response.pagination);
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement des messages', 'error');
        }
    }
    // Rendu des posts de l'utilisateur
    renderUserPosts(posts, pagination) {
        const postsContainer = document.getElementById('userPosts');
        if (!postsContainer) return;

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>Aucun message n'a été publié</p>
                </div>
            `;
            return;
        }

        postsContainer.innerHTML = posts.map(post => `
            <div class="post-item">
                <div class="post-header">
                    <h3>
                        <a href="/topic/${post._id}">${post.title || 'Réponse au sujet'}</a>
                    </h3>
                    <span class="post-date">${Helpers.formatDate(post.createdAt, 'relative')}</span>
                </div>
                <div class="post-preview">
                    ${Helpers.truncateText(post.content, 200)}
                </div>
                <div class="post-footer">
                    <div class="post-stats">
                        <span><i class="fas fa-thumbs-up"></i> ${post.likes.length}</span>
                        <span><i class="fas fa-reply"></i> ${post.replies?.length || 0}</span>
                    </div>
                    <a href="/forum/${post.forum._id}" class="forum-link">
                        ${post.forum.title}
                    </a>
                </div>
            </div>
        `).join('');

        this.renderPagination(pagination);
    }

    // Rendu de la pagination
    renderPagination(pagination) {
        const paginationContainer = document.getElementById('postsPagination');
        if (!paginationContainer) return;

        const pages = [];
        for (let i = 1; i <= pagination.pages; i++) {
            pages.push(`
                <button class="pagination-btn ${i === pagination.currentPage ? 'active' : ''}"
                        onclick="profilePage.changePage(${i})">
                    ${i}
                </button>
            `);
        }

        paginationContainer.innerHTML = pages.join('');
    }

    // Chargement des forums suivis
    async loadFollowedForums() {
        try {
            const response = await ForumService.getFollowedForums(this.userId);
            this.renderFollowedForums(response.data);
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement des forums suivis', 'error');
        }
    }

    // Rendu des forums suivis
    renderFollowedForums(forums) {
        const forumsContainer = document.getElementById('followedForums');
        if (!forumsContainer) return;

        if (forums.length === 0) {
            forumsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <p>Aucun forum suivi</p>
                </div>
            `;
            return;
        }

        forumsContainer.innerHTML = forums.map(forum => `
            <div class="forum-card">
                <h3><a href="/forum/${forum._id}">${forum.title}</a></h3>
                <p>${forum.description}</p>
                <div class="forum-stats">
                    <span><i class="fas fa-users"></i> ${forum.subscribersCount} abonnés</span>
                    <span><i class="fas fa-comments"></i> ${forum.postsCount} messages</span>
                </div>
            </div>
        `).join('');
    }

    // Mise à jour des paramètres
    async handleSettingsUpdate() {
        try {
            Loader.showButtonLoader(this.settingsForm.querySelector('button[type="submit"]'));
            
            const formData = new FormData(this.settingsForm);
            const data = Object.fromEntries(formData.entries());

            const response = await ForumService.updateUserProfile(data);
            this.user = response.data;
            
            NotificationComponent.show('Profil mis à jour avec succès', 'success');
            this.renderProfile();
        } catch (error) {
            NotificationComponent.show(error.message, 'error');
        } finally {
            Loader.hideButtonLoader(this.settingsForm.querySelector('button[type="submit"]'));
        }
    }

    // Mise à jour de l'avatar
    async handleAvatarUpload() {
        const input = document.getElementById('avatarUpload');
        if (!input?.files?.length) return;

        try {
            const formData = new FormData();
            formData.append('avatar', input.files[0]);

            const response = await ForumService.updateUserAvatar(formData);
            this.user.avatar = response.data.avatar;
            
            document.getElementById('userAvatar').src = this.user.avatar;
            NotificationComponent.show('Avatar mis à jour avec succès', 'success');
            Modal.close('avatarModal');
        } catch (error) {
            NotificationComponent.show(error.message, 'error');
        }
    }

    // Formulaire d'upload d'avatar
    getAvatarUploadForm() {
        return `
            <div class="avatar-upload-form">
                <div class="avatar-preview">
                    <img src="${this.user.avatar || '../assets/images/default-avatar.png'}" 
                         id="avatarPreview" alt="Aperçu">
                </div>
                <div class="form-group">
                    <label for="avatarUpload">Choisir une image</label>
                    <input type="file" id="avatarUpload" accept="image/*" required>
                    <small>Format JPG, PNG ou GIF. Taille maximale 2MB.</small>
                </div>
            </div>
        `;
    }
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    window.profilePage = new ProfilePage();
    profilePage.init();
});