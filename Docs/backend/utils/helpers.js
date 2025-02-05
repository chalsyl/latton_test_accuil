const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const { ValidationError } = require('./errors');

const helpers = {
    // Génération de token aléatoire
    generateToken: (bytes = 32) => {
        return crypto.randomBytes(bytes).toString('hex');
    },

    // Formatage de date
    formatDate: (date) => {
        return new Date(date).toISOString();
    },

    // Génération de slug
    generateSlug: (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Gestion des fichiers
    fileHelpers: {
        // Vérification du type MIME
        isAllowedMimeType: (mimetype) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            return allowedTypes.includes(mimetype);
        },

        // Création du chemin de fichier
        createFilePath: (filename, subfolder = '') => {
            return path.join('uploads', subfolder, filename);
        },

        // Suppression de fichier
        async deleteFile(filePath) {
            try {
                await fs.unlink(filePath);
                return true;
            } catch (error) {
                console.error('Erreur lors de la suppression du fichier:', error);
                return false;
            }
        }
    },

    // Pagination
    paginateResults: (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        return {
            skip,
            limit: parseInt(limit)
        };
    },

    // Formatage de la réponse
    formatResponse: (success, data = null, message = null) => {
        const response = { success };
        if (data) response.data = data;
        if (message) response.message = message;
        return response;
    },

    // Validation d'emails
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Sanitization de texte
    sanitizeText: (text) => {
        return text
            .trim()
            .replace(/[<>]/g, '')
            .substring(0, 5000); // Limite de caractères
    },

    // Conversion de taille de fichier
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },

    // Gestion des erreurs
    errorHelpers: {
        // Création d'une erreur de validation
        createValidationError: (message) => {
            return new ValidationError(message);
        },

        // Capture d'erreur async
        asyncErrorHandler: (fn) => {
            return (req, res, next) => {
                Promise.resolve(fn(req, res, next)).catch(next);
            };
        }
    },

    // Sécurité
    security: {
        // Génération de hash pour mot de passe réinitialisé
        generateResetHash: () => {
            return crypto.randomBytes(32).toString('hex');
        },

        // Vérification de force de mot de passe
        checkPasswordStrength: (password) => {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            const strongPassword = 
                password.length >= minLength &&
                hasUpperCase &&
                hasLowerCase &&
                hasNumbers &&
                hasSpecialChar;

            return {
                isStrong: strongPassword,
                requirements: {
                    minLength: password.length >= minLength,
                    hasUpperCase,
                    hasLowerCase,
                    hasNumbers,
                    hasSpecialChar
                }
            };
        }
    }
};

module.exports = helpers;