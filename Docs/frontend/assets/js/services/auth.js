const AuthService = {
    // Inscription d'un nouvel utilisateur
    async register(userData) {
        try {
            const response = await ApiService.post('/auth/register', userData);
            if (response.success) {
                this.setAuthData(response.data);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Connexion utilisateur
    async login(credentials) {
        try {
            const response = await ApiService.post('/auth/login', credentials);
            if (response.success) {
                this.setAuthData(response.data);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Déconnexion
    async logout() {
        try {
            await ApiService.post('/auth/logout');
            this.clearAuthData();
            return { success: true };
        } catch (error) {
            this.clearAuthData();
            throw error;
        }
    },

    // Récupération de l'utilisateur actuel
    async getCurrentUser() {
        try {
            return await ApiService.get('/auth/me');
        } catch (error) {
            if (error.status === 401) {
                this.clearAuthData();
            }
            throw error;
        }
    },

    // Demande de réinitialisation de mot de passe
    async forgotPassword(email) {
        try {
            return await ApiService.post('/auth/forgot-password', { email });
        } catch (error) {
            throw error;
        }
    },

    // Réinitialisation du mot de passe
    async resetPassword(token, newPassword) {
        try {
            return await ApiService.put('/auth/reset-password', {
                token,
                password: newPassword
            });
        } catch (error) {
            throw error;
        }
    },

    // Mise à jour du profil
    async updateProfile(userData) {
        try {
            return await ApiService.put('/auth/profile', userData);
        } catch (error) {
            throw error;
        }
    },

    // Mise à jour du mot de passe
    async updatePassword(passwords) {
        try {
            return await ApiService.put('/auth/password', passwords);
        } catch (error) {
            throw error;
        }
    },

    // Vérification de l'email
    async verifyEmail(token) {
        try {
            return await ApiService.get(`/auth/verify-email/${token}`);
        } catch (error) {
            throw error;
        }
    },

    // Renvoi de l'email de vérification
    async resendVerificationEmail() {
        try {
            return await ApiService.post('/auth/resend-verification');
        } catch (error) {
            throw error;
        }
    },

    // Rafraîchissement du token
    async refreshToken() {
        try {
            const response = await ApiService.post('/auth/refresh-token');
            if (response.success) {
                this.setAuthData(response.data);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Stockage des données d'authentification
    setAuthData(data) {
        if (data.token) {
            localStorage.setItem('token', data.token);
            ApiService.setToken(data.token);
        }
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    },

    // Suppression des données d'authentification
    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        ApiService.setToken(null);
    },

    // Vérification si l'utilisateur est connecté
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Récupération de l'utilisateur stocké
    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

// Exportation pour utilisation dans d'autres modules
window.AuthService = AuthService;