const ForumService = {
    // Récupérer tous les forums
    async getForums(params = {}) {
        try {
            return await ApiService.get('/forums', params);
        } catch (error) {
            throw error;
        }
    },

    // Récupérer un forum par son ID
    async getForum(forumId) {
        try {
            return await ApiService.get(`/forums/${forumId}`);
        } catch (error) {
            throw error;
        }
    },

    // Créer un nouveau forum
    async createForum(forumData) {
        try {
            return await ApiService.post('/forums', forumData);
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour un forum
    async updateForum(forumId, forumData) {
        try {
            return await ApiService.put(`/forums/${forumId}`, forumData);
        } catch (error) {
            throw error;
        }
    },

    // Supprimer un forum
    async deleteForum(forumId) {
        try {
            return await ApiService.delete(`/forums/${forumId}`);
        } catch (error) {
            throw error;
        }
    },

    // Récupérer les posts d'un forum
    async getForumPosts(forumId, params = {}) {
        try {
            return await ApiService.get(`/forums/${forumId}/posts`, params);
        } catch (error) {
            throw error;
        }
    },

    // Ajouter un modérateur
    async addModerator(forumId, userId) {
        try {
            return await ApiService.post(`/forums/${forumId}/moderators`, { userId });
        } catch (error) {
            throw error;
        }
    },

    // Retirer un modérateur
    async removeModerator(forumId, userId) {
        try {
            return await ApiService.delete(`/forums/${forumId}/moderators/${userId}`);
        } catch (error) {
            throw error;
        }
    },

    // Ajouter une règle
    async addRule(forumId, ruleData) {
        try {
            return await ApiService.post(`/forums/${forumId}/rules`, ruleData);
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour une règle
    async updateRule(forumId, ruleId, ruleData) {
        try {
            return await ApiService.put(`/forums/${forumId}/rules/${ruleId}`, ruleData);
        } catch (error) {
            throw error;
        }
    },

    // Supprimer une règle
    async deleteRule(forumId, ruleId) {
        try {
            return await ApiService.delete(`/forums/${forumId}/rules/${ruleId}`);
        } catch (error) {
            throw error;
        }
    },

    // Bannir un utilisateur
    async banUser(forumId, userData) {
        try {
            return await ApiService.post(`/forums/${forumId}/bans`, userData);
        } catch (error) {
            throw error;
        }
    },

    // Débannir un utilisateur
    async unbanUser(forumId, userId) {
        try {
            return await ApiService.delete(`/forums/${forumId}/bans/${userId}`);
        } catch (error) {
            throw error;
        }
    },

    // Obtenir les statistiques d'un forum
    async getForumStats(forumId) {
        try {
            return await ApiService.get(`/forums/${forumId}/stats`);
        } catch (error) {
            throw error;
        }
    },

    // Suivre un forum
    async followForum(forumId) {
        try {
            return await ApiService.post(`/forums/${forumId}/follow`);
        } catch (error) {
            throw error;
        }
    },

    // Ne plus suivre un forum
    async unfollowForum(forumId) {
        try {
            return await ApiService.delete(`/forums/${forumId}/follow`);
        } catch (error) {
            throw error;
        }
    },

    // Rechercher dans un forum
    async searchInForum(forumId, searchParams) {
        try {
            return await ApiService.get(`/forums/${forumId}/search`, searchParams);
        } catch (error) {
            throw error;
        }
    },

    // Obtenir les forums populaires
    async getPopularForums() {
        try {
            return await ApiService.get('/forums/popular');
        } catch (error) {
            throw error;
        }
    },

    // Obtenir les catégories de forums
    async getCategories() {
        try {
            return await ApiService.get('/forums/categories');
        } catch (error) {
            throw error;
        }
    }
};

// Exportation pour utilisation dans d'autres modules
window.ForumService = ForumService;