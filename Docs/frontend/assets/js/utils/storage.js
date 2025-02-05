const StorageUtils = {
    // Stockage local
    local: {
        // Sauvegarder une donnée
        set(key, value, expiresIn = null) {
            const item = {
                value: value,
                timestamp: new Date().getTime()
            };

            if (expiresIn) {
                item.expiresAt = item.timestamp + (expiresIn * 1000);
            }

            localStorage.setItem(key, JSON.stringify(item));
        },

        // Récupérer une donnée
        get(key) {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsedItem = JSON.parse(item);

            // Vérifier l'expiration
            if (parsedItem.expiresAt && new Date().getTime() > parsedItem.expiresAt) {
                this.remove(key);
                return null;
            }

            return parsedItem.value;
        },

        // Supprimer une donnée
        remove(key) {
            localStorage.removeItem(key);
        },

        // Tout effacer
        clear() {
            localStorage.clear();
        }
    },

    // Stockage de session
    session: {
        // Sauvegarder une donnée
        set(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },

        // Récupérer une donnée
        get(key) {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },

        // Supprimer une donnée
        remove(key) {
            sessionStorage.removeItem(key);
        },

        // Tout effacer
        clear() {
            sessionStorage.clear();
        }
    },

    // Cookies
    cookie: {
        // Définir un cookie
        set(name, value, days = 7, path = '/') {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Strict`;
        },

        // Récupérer un cookie
        get(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        },

        // Supprimer un cookie
        remove(name, path = '/') {
            this.set(name, '', -1, path);
        }
    },

    // Cache
    cache: {
        // Map pour stocker les données en mémoire
        _cache: new Map(),

        // Définir une donnée en cache
        set(key, value, ttl = 300) {  // TTL par défaut : 5 minutes
            const expiresAt = Date.now() + (ttl * 1000);
            this._cache.set(key, {
                value,
                expiresAt
            });
        },

        // Récupérer une donnée du cache
        get(key) {
            const item = this._cache.get(key);
            if (!item) return null;

            if (Date.now() > item.expiresAt) {
                this._cache.delete(key);
                return null;
            }

            return item.value;
        },

        // Supprimer une donnée du cache
        remove(key) {
            this._cache.delete(key);
        },

        // Nettoyer le cache expiré
        cleanup() {
            const now = Date.now();
            for (const [key, item] of this._cache.entries()) {
                if (now > item.expiresAt) {
                    this._cache.delete(key);
                }
            }
        }
    }
};

// Nettoyage périodique du cache (toutes les 5 minutes)
setInterval(() => {
    StorageUtils.cache.cleanup();
}, 300000);

// Exportation pour utilisation dans d'autres modules
window.StorageUtils = StorageUtils;