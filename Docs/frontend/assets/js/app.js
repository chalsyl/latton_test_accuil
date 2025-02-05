/* assets/js/app.js - Version Fusionnée */

// Importez les composants et services si vous utilisez un système de modules (sinon, assurez-vous qu'ils sont déclarés globalement avant app.js dans index.html)
// import { AuthService } from './services/auth.js'; // Exemple si AuthService est un module
// import { Header } from './components/header.js'; // Exemple pour les composants
// ... autres importations

// Initialisation de l'application
const App = {
    // État global de l'application
    state: {
        currentUser: null,
        isAuthenticated: false,
        theme: localStorage.getItem('theme') || 'light',
        notifications: [], // Pourrait être utilisé pour les notifications backend
        notificationCount: 3, // Pour le badge de notifications UI (simulé initialement)
        isProfileDropdownOpen: false, // État du menu déroulant du profil
        stats: { // Données pour les statistiques
            members: 12543, // Valeurs finales (pour l'animation)
            topics: 5678,
            replies: 89012
        },
        isStatsAnimated: false // Pour éviter de relancer l'animation des stats si init est appelé plusieurs fois
    },

    // Initialisation
    init() {
        this.checkAuth();
        this.initTheme();
        this.initComponents();
        this.bindEvents();
        this.initHomePageFeatures(); // Initialisation des fonctionnalités spécifiques à la page d'accueil
    },

    // Vérification de l'authentification
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await AuthService.getCurrentUser();
                if (response.success) {
                    this.state.currentUser = response.data.user;
                    this.state.isAuthenticated = true;
                    this.updateUI();
                }
            } catch (error) {
                console.error('Erreur d\'authentification:', error);
                localStorage.removeItem('token');
            }
        }
    },

    // Initialisation du thème (inchangé)
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
    },

    // Initialisation des composants (inchangé)
    initComponents() {
        Header.init();
        Footer.init();
        Modal.init();
        Forms.init();
        NotificationComponent.init();
    },

    // Liaison des événements (fusionné avec les événements du nouveau app.js)
    bindEvents() {
        // Gestion du changement de thème (inchangé)
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Gestion de la déconnexion (inchangé)
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Gestion des notifications (inchangé - mais peut-être à adapter si NotificationComponent a une logique de toggle)
        document.getElementById('notificationsBtn')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        // --- NOUVEAUX ÉVÉNEMENTS (fonctionnalités de la page d'accueil) ---
        const loginBtn = document.getElementById('loginBtn'); // Bouton Connexion
        const logoutBtnUI = document.getElementById('logoutBtn'); // Bouton Déconnexion dans le menu profil (déclaré à nouveau pour être sûr)
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        // Simuler la connexion lors du clic sur "Connexion"
        loginBtn?.addEventListener('click', () => { // Sécurité avec '?' au cas où loginBtn n'est pas trouvé
            this.simulateLogin(); // Utilisation d'une fonction pour la logique de connexion simulée
        });

        // Simuler la déconnexion lors du clic sur "Déconnexion" (du menu profil)
        logoutBtnUI?.addEventListener('click', () => { // Sécurité avec '?'
            this.logout(); // Réutilisation de la fonction de déconnexion existante (ou adaptez si nécessaire)
        });

        // Gestion du menu déroulant du profil
        profileBtn?.addEventListener('click', (event) => { // Sécurité avec '?'
            event.stopPropagation();
            this.toggleProfileDropdown(); // Utilisation d'une fonction pour gérer le dropdown
        });

        // Fermer le dropdown si on clique en dehors
        document.addEventListener('click', (event) => {
            if (this.state.isProfileDropdownOpen && profileBtn && profileDropdown && !profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
                this.closeProfileDropdownUI(); // Utilisation d'une fonction pour fermer l'UI du dropdown
            }
        });
    },

    // Mise à jour de l'interface utilisateur (fusionné avec la logique de connexion/déconnexion du nouveau app.js)
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.getElementById('userAvatar');
        const username = document.getElementById('username');

        if (this.state.isAuthenticated && this.state.currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (userAvatar) userAvatar.src = this.state.currentUser.avatar || '../assets/images/default-avatar.png';
            if (username) username.textContent = this.state.currentUser.username;
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
        // Appeler d'autres fonctions de mise à jour de l'UI si nécessaire (badges, etc.)
        this.updateNotificationBadgeUI();
    },

    // Changement de thème (inchangé)
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.initTheme();
    },

    // Déconnexion (inchangé - mais peut-être à adapter selon AuthService.logout())
    async logout() {
        try {
            await AuthService.logout();
            localStorage.removeItem('token');
            this.state.currentUser = null;
            this.state.isAuthenticated = false;
            this.updateUI();
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            NotificationComponent.show('Erreur lors de la déconnexion', 'error');
        }
    },

    // Gestion des notifications (toggleNotifications inchangé - mais peut-être à adapter selon NotificationComponent)
    toggleNotifications() {
        NotificationComponent.toggle();
    },

    // Navigation (inchangé)
    navigate(path) {
        window.location.href = path;
    },

    // Gestion des erreurs globale (inchangé)
    handleError(error) {
        console.error('Erreur:', error);
        if (error.response?.status === 401) {
            this.logout();
        }
        NotificationComponent.show(
            error.message || 'Une erreur est survenue',
            'error'
        );
    },

    // Utilitaires (inchangé)
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Vérification des permissions (inchangé)
    hasPermission(permission) {
        if (!this.state.currentUser) return false;
        return this.state.currentUser.role === 'admin' ||
               this.state.currentUser.permissions?.includes(permission);
    },

    // --- NOUVELLES FONCTIONNALITÉS (page d'accueil) ---

    initHomePageFeatures() {
        this.initStatsAnimation();
        this.injectPopularForums();
        this.injectRecentDiscussions();
        this.initNotificationBadge(); // Initialiser le badge de notifications (UI)
    },

    // --- Gestion de l'état de connexion (simulé pour cet exemple) ---
    simulateLogin() {
        this.state.isAuthenticated = true;
        this.updateUI();
        // Ici, vous ajouteriez la logique pour afficher la modale de connexion,
        // puis après une connexion réussie, mettre isLoggedIn à true et appeler updateUI()
        alert('Connexion simulée ! Vous êtes maintenant connecté (simulé).'); // Remplacer par la logique réelle
        this.updateUsernameAndAvatarUI('Thomas', '../assets/images/default-avatar.png'); // Simuler le nom d'utilisateur et l'avatar
    },

    // --- Gestion du menu déroulant du profil ---
    toggleProfileDropdown() {
        this.state.isProfileDropdownOpen = !this.state.isProfileDropdownOpen;
        if (this.state.isProfileDropdownOpen) {
            this.openProfileDropdownUI();
        } else {
            this.closeProfileDropdownUI();
        }
    },

    closeProfileDropdownUI() {
        const profileDropdown = document.getElementById('profileDropdown');
        const profileBtn = document.getElementById('profileBtn');
        profileDropdown.style.display = 'none';
        this.state.isProfileDropdownOpen = false;
        profileBtn.setAttribute('aria-expanded', 'false'); // Accessibilité
    },

    openProfileDropdownUI() {
        const profileDropdown = document.getElementById('profileDropdown');
        const profileBtn = document.getElementById('profileBtn');
        profileDropdown.style.display = 'block';
        this.state.isProfileDropdownOpen = true;
        profileBtn.setAttribute('aria-expanded', 'true'); // Accessibilité
    },

    // --- Gestion du badge de notifications UI ---
    initNotificationBadge() {
        this.updateNotificationBadgeUI(); // Initialisation initiale
        // Simuler la mise à jour du nombre de notifications (exemple)
        setInterval(() => {
            this.state.notificationCount = (this.state.notificationCount + 1) % 10; // Compteur cyclique de 0 à 9
            this.updateNotificationBadgeUI();
        }, 5000); // Mise à jour toutes les 5 secondes (exemple)
    },

    updateNotificationBadgeUI() {
        const notificationCountSpan = document.getElementById('notificationCount');
        if (this.state.notificationCount > 0) {
            notificationCountSpan.textContent = this.state.notificationCount;
            notificationCountSpan.style.display = 'flex'; // ou 'block' selon votre CSS pour notification-count
        } else {
            notificationCountSpan.style.display = 'none';
        }
    },


    // --- Animation des statistiques ---
    initStatsAnimation() {
        if (this.state.isStatsAnimated) return; // Éviter de relancer l'animation si déjà lancée
        this.state.isStatsAnimated = true; // Marquer comme animée

        const memberCountElement = document.getElementById('memberCount');
        const topicCountElement = document.getElementById('topicCount');
        const replyCountElement = document.getElementById('replyCount');

        const duration = 2000; // Durée de l'animation en millisecondes
        const steps = 50; // Nombre d'étapes d'incrémentation
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            memberCountElement.textContent = Math.floor((this.state.stats.members / steps) * currentStep).toLocaleString();
            topicCountElement.textContent = Math.floor((this.state.stats.topics / steps) * currentStep).toLocaleString();
            replyCountElement.textContent = Math.floor((this.state.stats.replies / steps) * currentStep).toLocaleString();

            if (currentStep === steps) {
                clearInterval(timer);
                // S'assurer que les valeurs finales sont bien affichées après l'animation
                memberCountElement.textContent = this.state.stats.members.toLocaleString();
                topicCountElement.textContent = this.state.stats.topics.toLocaleString();
                replyCountElement.textContent = this.state.stats.replies.toLocaleString();
            }
        }, interval);
    },


    // --- Fonction pour mettre à jour le nom d'utilisateur et l'avatar (simulé) ---
    updateUsernameAndAvatarUI(username, avatarSrc) {
        const usernameSpan = document.getElementById('username');
        const userAvatarImg = document.getElementById('userAvatar');
        usernameSpan.textContent = username;
        userAvatarImg.src = avatarSrc;
    },


    // --- Injecter des forums populaires (exemple statique) ---
    injectPopularForums() {
        const popularForumsGrid = document.getElementById('popularForums');
        const popularForumsData = [
            {
                title: "Développement Web",
                description: "Discussions sur les dernières technologies web et bonnes pratiques",
                members: 1253,
                topics: 486,
                iconClass: "fas fa-code" // Exemple d'icône Font Awesome
            },
            {
                title: "Intelligence Artificielle",
                description: "Explorez le monde fascinant de l'IA et du machine learning",
                members: 892,
                topics: 325,
                iconClass: "fas fa-robot"
            },
            {
                title: "Design & UX",
                description: "Partagez vos créations et obtenez des retours d'experts",
                members: 743,
                topics: 291,
                iconClass: "fas fa-palette"
            }
        ];

        popularForumsData.forEach(forum => {
            const forumCard = document.createElement('li');
            forumCard.classList.add('premium-card', 'p-6'); // Classes CSS pour le style
            forumCard.innerHTML = `
                <h3 class="text-xl font-semibold text-latton-teal mb-3">${forum.title}</h3>
                <p class="text-latton-teal/70 mb-6">${forum.description}</p>
                <div class="flex items-center justify-between text-sm text-latton-teal/60 forum-stats">
                    <div class="flex items-center gap-1 stat-item">
                        <i class="${forum.iconClass} text-latton-teal"></i>
                        <span>${forum.members.toLocaleString()} membres</span>
                    </div>
                    <div class="flex items-center gap-1 stat-item">
                        <i class="fas fa-comments text-latton-teal"></i>
                        <span>${forum.topics.toLocaleString()} sujets</span>
                    </div>
                </div>
            `;
            popularForumsGrid.appendChild(forumCard);
        });
    },


    // --- Injecter des discussions récentes (exemple statique - à adapter selon vos besoins) ---
    injectRecentDiscussions() {
        const recentDiscussionsList = document.getElementById('recentDiscussions');
        const recentDiscussionsData = [
            "Dernières tendances en JavaScript moderne",
            "Comparaison des frameworks CSS : Tailwind vs. Bootstrap",
            "L'avenir de l'Intelligence Artificielle dans le développement web",
            // ... ajoutez plus de discussions ici si vous voulez
        ];

        recentDiscussionsData.forEach(discussionTitle => {
            const discussionItem = document.createElement('li');
            discussionItem.textContent = discussionTitle;
            // Vous pouvez ajouter des classes CSS pour styliser les éléments de la liste si nécessaire
            recentDiscussionsList.appendChild(discussionItem);
        });
    },


    // --- Initialisation (peut être déplacé dans une fonction init() si le code devient plus long) ---
    logInit() {
        console.log('Page d\'accueil initialisée avec App Object.'); // Confirmation dans la console
    }
};

// Initialisation de l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.logInit(); // Confirmation d'initialisation
});

// assets/js/app.js
import { initHomePage } from './pages/home.js';

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
  // Initialiser d'autres pages si nécessaire
});

// Exportation pour utilisation dans d'autres modules (si nécessaire)
window.App = App;