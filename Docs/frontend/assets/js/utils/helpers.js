const Helpers = {
    // Formatage de date
    formatDate(date, format = 'default') {
        const d = new Date(date);
        const options = {
            default: {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            short: {
                day: 'numeric',
                month: 'short'
            },
            relative: (date) => {
                const now = new Date();
                const diff = now - date;
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (seconds < 60) return 'À l\'instant';
                if (minutes < 60) return `Il y a ${minutes} min`;
                if (hours < 24) return `Il y a ${hours}h`;
                if (days < 30) return `Il y a ${days}j`;
                return d.toLocaleDateString('fr-FR');
            }
        };

        if (format === 'relative') {
            return options.relative(d);
        }

        return d.toLocaleDateString('fr-FR', options[format] || options.default);
    },

    // Troncature de texte
    truncateText(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    },

    // Génération de slug
    slugify(text) {
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    },

    // Formatage de nombre
    formatNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'k';
        }
        return number.toString();
    },

    // Formatage de taille de fichier
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    },

    // Création d'un identifiant unique
    generateUniqueId(prefix = 'id') {
        return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Copie dans le presse-papiers
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            return false;
        }
    },

    // Extraction des couleurs dominantes d'une image
    async getImageColors(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = this.width;
                canvas.height = this.height;
                ctx.drawImage(this, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const colors = {};
                
                for (let i = 0; i < imageData.length; i += 4) {
                    const rgb = `rgb(${imageData[i]},${imageData[i+1]},${imageData[i+2]})`;
                    colors[rgb] = (colors[rgb] || 0) + 1;
                }
                
                resolve(Object.entries(colors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([color]) => color));
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    },

    // Sérialisation de formulaire
    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
};

// Exportation pour utilisation dans d'autres modules
window.Helpers = Helpers;