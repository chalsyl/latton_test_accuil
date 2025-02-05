const ApiService = {
    // Configuration de base
    baseURL: '/api',
    defaultHeaders: {
        'Content-Type': 'application/json'
    },

    // Initialisation
    init() {
        // Récupérer le token d'authentification
        const token = localStorage.getItem('token');
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    },

    // Méthode GET
    async get(endpoint, params = {}) {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseURL}${endpoint}${queryString}`;

        try {
            const response = await this.sendRequest(url, {
                method: 'GET',
                headers: this.defaultHeaders
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Méthode POST
    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Méthode PUT
    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await this.sendRequest(url, {
                method: 'PUT',
                headers: this.defaultHeaders,
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Méthode DELETE
    async delete(endpoint) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await this.sendRequest(url, {
                method: 'DELETE',
                headers: this.defaultHeaders
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Upload de fichier
    async upload(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { ...this.defaultHeaders };
        delete headers['Content-Type']; // Laisser le navigateur définir le bon Content-Type

        try {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers,
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Construction de la chaîne de requête
    buildQueryString(params) {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    },

    // Envoi de la requête avec gestion du timeout
    async sendRequest(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    // Gestion de la réponse
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || 'Une erreur est survenue',
                data
            };
        }

        return data;
    },

    // Gestion des erreurs
    handleError(error) {
        if (error.name === 'AbortError') {
            return {
                status: 408,
                message: 'La requête a expiré'
            };
        }

        return {
            status: error.status || 500,
            message: error.message || 'Une erreur est survenue',
            data: error.data
        };
    },

    // Mise à jour du token
    setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete this.defaultHeaders['Authorization'];
        }
    },

    // Vérification du statut de l'API
    async checkHealth() {
        try {
            const response = await this.get('/health');
            return response.status === 'ok';
        } catch (error) {
            console.error('Erreur de connexion à l\'API:', error);
            return false;
        }
    }
};

// Initialisation du service
ApiService.init();

// Exportation pour utilisation dans d'autres modules
window.ApiService = ApiService;