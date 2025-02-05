class TopicPage {
    constructor() {
        this.topicId = this.getTopicIdFromUrl();
        this.topic = null;
        this.editor = null;
        this.currentPage = 1;
        this.repliesPerPage = 20;

        // Éléments DOM
        this.topicContainer = document.querySelector('.topic-content');
        this.repliesContainer = document.querySelector('.replies-container');
        this.replyForm = document.getElementById('postReplyForm');
    }

    // Initialisation
    async init() {
        try {
            await this.loadTopic();
            this.initEditor();
            this.bindEvents();
            this.setupReplyForm();
            Loader.hide();
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement du sujet', 'error');
            console.error(error);
        }
    }

    // Récupération de l'ID du sujet depuis l'URL
    getTopicIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    // Chargement du sujet
    async loadTopic() {
        try {
            Loader.show(this.topicContainer);
            const response = await ForumService.getTopicById(this.topicId);
            this.topic = response.data;
            this.renderTopic();
            this.loadReplies();
        } catch (error) {
            throw error;
        } finally {
            Loader.hide(this.topicContainer);
        }
    }

    // Initialisation de l'éditeur
    initEditor() {
        if (!document.getElementById('replyContent')) return;

        this.editor = new SimpleMDE({
            element: document.getElementById('replyContent'),
            spellChecker: false,
            status: false,
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', '|',
                'preview', 'guide'
            ]
        });
    }

    // Liaison des événements
    bindEvents() {
        // Gestion des likes
        document.getElementById('likeBtn')?.addEventListener('click', () => {
            this.handleLike();
        });

        // Gestion du partage
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            this.handleShare();
        });

        // Gestion des signalements
        document.getElementById('reportBtn')?.addEventListener('click', () => {
            this.showReportModal();
        });

        // Gestion de la suppression (si autorisé)
        document.getElementById('deleteTopicBtn')?.addEventListener('click', () => {
            this.showDeleteConfirmation();
        });

        // Gestion de l'édition (si autorisé)
        document.getElementById('editTopicBtn')?.addEventListener('click', () => {
            this.showEditModal();
        });
    }

    // Configuration du formulaire de réponse
    setupReplyForm() {
        if (!this.replyForm) return;

        this.replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleReply();
        });
    }

    // Rendu du sujet
    renderTopic() {
        document.title = `${this.topic.title} - Forum`;
        
        // Mettre à jour le fil d'Ariane
        document.getElementById('topicTitle').textContent = this.topic.title;
        document.getElementById('forumLink').href = `/forum/${this.topic.forum._id}`;
        document.getElementById('forumLink').textContent = this.topic.forum.title;

        // Mettre à jour le contenu principal
        document.getElementById('topicMainTitle').textContent = this.topic.title;
        document.getElementById('authorLink').textContent = this.topic.author.username;
        document.getElementById('authorLink').href = `/profile/${this.topic.author._id}`;
        document.getElementById('createdAt').textContent = Helpers.formatDate(this.topic.createdAt);
        document.getElementById('viewCount').textContent = Helpers.formatNumber(this.topic.views);
        document.getElementById('replyCount').textContent = Helpers.formatNumber(this.topic.replyCount);

        // Mettre à jour les informations de l'auteur
        document.getElementById('authorAvatar').src = this.topic.author.avatar || '../assets/images/default-avatar.png';
        document.getElementById('authorName').textContent = this.topic.author.username;
        document.getElementById('authorRole').textContent = this.topic.author.role;
        document.getElementById('authorJoinDate').textContent = `Membre depuis ${Helpers.formatDate(this.topic.author.createdAt, 'short')}`;
        document.getElementById('authorPostCount').textContent = `Posts: ${this.topic.author.stats.postsCount}`;

        // Mettre à jour le contenu
        document.getElementById('topicContent').innerHTML = marked(this.topic.content);

        // Mettre à jour les boutons d'action selon les permissions
        this.updateActionButtons();
    }

    // Mise à jour des boutons d'action
    updateActionButtons() {
        const currentUser = App.state.currentUser;
        const isAuthor = currentUser && currentUser.id === this.topic.author._id;
        const isAdmin = currentUser && currentUser.role === 'admin';

        if (document.getElementById('editTopicBtn')) {
            document.getElementById('editTopicBtn').style.display = 
                (isAuthor || isAdmin) ? 'inline-flex' : 'none';
        }

        if (document.getElementById('deleteTopicBtn')) {
            document.getElementById('deleteTopicBtn').style.display = 
                (isAuthor || isAdmin) ? 'inline-flex' : 'none';
        }

        // Mettre à jour l'état du bouton Like
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn && this.topic.likes) {
            likeBtn.classList.toggle('active', 
                this.topic.likes.some(like => like.user === currentUser?.id));
        }
    }
    // Chargement des réponses
    async loadReplies() {
        try {
            Loader.show(this.repliesContainer);
            const response = await ForumService.getTopicReplies(this.topicId, {
                page: this.currentPage,
                limit: this.repliesPerPage
            });
            
            this.renderReplies(response.data);
            this.renderPagination(response.pagination);
        } catch (error) {
            NotificationComponent.show('Erreur lors du chargement des réponses', 'error');
        } finally {
            Loader.hide(this.repliesContainer);
        }
    }

    // Rendu des réponses
    renderReplies(replies) {
        if (!this.repliesContainer) return;

        if (replies.length === 0) {
            this.repliesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>Soyez le premier à répondre à cette discussion!</p>
                </div>
            `;
            return;
        }

        this.repliesContainer.innerHTML = replies.map((reply, index) => 
            this.renderReply(reply, index + 1)
        ).join('');
    }

    // Rendu d'une réponse
    renderReply(reply, index) {
        const position = (this.currentPage - 1) * this.repliesPerPage + index;
        return `
            <div class="reply" id="reply-${reply._id}">
                <div class="post-sidebar">
                    <div class="user-info">
                        <img src="${reply.author.avatar || '../assets/images/default-avatar.png'}" 
                             alt="Avatar de ${reply.author.username}">
                        <div class="user-details">
                            <a href="/profile/${reply.author._id}" class="username">
                                ${reply.author.username}
                            </a>
                            <span class="user-role">${reply.author.role}</span>
                            <span class="post-count">Posts: ${reply.author.stats.postsCount}</span>
                        </div>
                    </div>
                </div>
                <div class="post-main">
                    <div class="reply-header">
                        <div class="reply-meta">
                            <a href="#reply-${reply._id}" class="reply-number">#${position}</a>
                            <span class="reply-date">
                                ${Helpers.formatDate(reply.createdAt, 'relative')}
                            </span>
                            ${reply.isEdited ? `
                                <span class="edited-mark" title="Modifié le ${Helpers.formatDate(reply.editedAt)}">
                                    (modifié)
                                </span>
                            ` : ''}
                        </div>
                        ${this.renderReplyActions(reply)}
                    </div>
                    <div class="reply-content">
                        ${marked(reply.content)}
                    </div>
                    <div class="reply-footer">
                        <div class="reply-actions">
                            <button class="btn-like" onclick="topicPage.handleReplyLike('${reply._id}')">
                                <i class="fas fa-thumbs-up"></i>
                                <span>${Helpers.formatNumber(reply.likes.length)}</span>
                            </button>
                            <button class="btn-quote" onclick="topicPage.quoteReply('${reply._id}')">
                                <i class="fas fa-quote-right"></i> Citer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Rendu des actions de réponse
    renderReplyActions(reply) {
        const currentUser = App.state.currentUser;
        const isAuthor = currentUser && currentUser.id === reply.author._id;
        const isAdmin = currentUser && currentUser.role === 'admin';

        if (!isAuthor && !isAdmin) return '';

        return `
            <div class="reply-actions">
                <button class="btn-edit" onclick="topicPage.showEditReplyModal('${reply._id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-delete" onclick="topicPage.showDeleteReplyConfirmation('${reply._id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
    }

    // Gestion des likes
    async handleLike() {
        if (!App.state.isAuthenticated) {
            NotificationComponent.show('Vous devez être connecté pour aimer un sujet', 'warning');
            return;
        }

        try {
            const response = await ForumService.toggleTopicLike(this.topicId);
            const likeBtn = document.getElementById('likeBtn');
            const likeCount = document.getElementById('likeCount');
            
            likeBtn.classList.toggle('active', response.data.isLiked);
            likeCount.textContent = Helpers.formatNumber(response.data.likesCount);
        } catch (error) {
            NotificationComponent.show('Erreur lors de l\'action "J\'aime"', 'error');
        }
    }
    // Gestion du partage
    handleShare() {
        const shareUrl = window.location.href;
        Modal.create({
            id: 'shareModal',
            title: 'Partager cette discussion',
            content: `
                <div class="share-options">
                    <div class="share-link">
                        <input type="text" value="${shareUrl}" readonly id="shareUrlInput">
                        <button class="btn btn-primary" onclick="topicPage.copyShareLink()">
                            <i class="fas fa-copy"></i> Copier
                        </button>
                    </div>
                    <div class="social-share">
                        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}" 
                           target="_blank" class="btn btn-twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" 
                           target="_blank" class="btn btn-facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </a>
                    </div>
                </div>
            `
        });
    }

    // Copie du lien de partage
    async copyShareLink() {
        const input = document.getElementById('shareUrlInput');
        if (await Helpers.copyToClipboard(input.value)) {
            NotificationComponent.show('Lien copié dans le presse-papiers', 'success');
        }
    }

    // Gestion de la réponse
    async handleReply() {
        if (!this.editor) return;

        const content = this.editor.value();
        if (!content.trim()) {
            NotificationComponent.show('Le contenu de la réponse ne peut pas être vide', 'warning');
            return;
        }

        try {
            Loader.showButtonLoader(this.replyForm.querySelector('button[type="submit"]'));
            
            const response = await ForumService.createReply(this.topicId, { content });
            
            this.editor.value('');
            await this.loadReplies();
            
            NotificationComponent.show('Réponse publiée avec succès', 'success');
            
            // Scroll vers la dernière réponse
            const lastReply = document.querySelector('.reply:last-child');
            if (lastReply) {
                lastReply.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            NotificationComponent.show(error.message, 'error');
        } finally {
            Loader.hideButtonLoader(this.replyForm.querySelector('button[type="submit"]'));
        }
    }

    // Citation d'une réponse
    quoteReply(replyId) {
        const reply = document.getElementById(`reply-${replyId}`);
        if (!reply || !this.editor) return;

        const author = reply.querySelector('.username').textContent;
        const content = reply.querySelector('.reply-content').textContent;

        const quote = `> **${author} a écrit:**\n> ${content.trim()}\n\n`;
        this.editor.value(this.editor.value() + quote);

        // Scroll vers le formulaire de réponse
        this.replyForm.scrollIntoView({ behavior: 'smooth' });
        this.editor.codemirror.focus();
    }

    // Affichage de la modale de signalement
    showReportModal() {
        if (!App.state.isAuthenticated) {
            NotificationComponent.show('Vous devez être connecté pour signaler un contenu', 'warning');
            return;
        }

        Modal.create({
            id: 'reportModal',
            title: 'Signaler ce contenu',
            content: this.getReportForm(),
            buttons: [
                {
                    text: 'Annuler',
                    class: 'btn-secondary',
                    action: 'cancel',
                    closeModal: true
                },
                {
                    text: 'Signaler',
                    class: 'btn-primary',
                    action: 'report',
                    callback: () => this.handleReport()
                }
            ]
        });
    }

    // Obtention du formulaire de signalement
    getReportForm() {
        return `
            <form id="reportForm">
                <div class="form-group">
                    <label for="reportReason">Raison</label>
                    <select id="reportReason" name="reason" required>
                        <option value="">Sélectionnez une raison</option>
                        <option value="spam">Spam</option>
                        <option value="inappropriate">Contenu inapproprié</option>
                        <option value="harassment">Harcèlement</option>
                        <option value="other">Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reportDetails">Détails</label>
                    <textarea id="reportDetails" name="details" required></textarea>
                </div>
            </form>
        `;
    }

    // Gestion du signalement
    async handleReport() {
        const form = document.getElementById('reportForm');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await ForumService.reportContent(this.topicId, data);
            NotificationComponent.show('Signalement envoyé avec succès', 'success');
            Modal.close('reportModal');
        } catch (error) {
            NotificationComponent.show(error.message, 'error');
        }
    }
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    window.topicPage = new TopicPage();
    topicPage.init();
});