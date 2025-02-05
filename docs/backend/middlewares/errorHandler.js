const { ValidationError } = require('../utils/errors');

const errorHandler = {
    // Middleware de gestion globale des erreurs
    async handleError(err, req, res, next) {
        let error = { ...err };
        error.message = err.message;

        // Log de l'erreur en développement
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }

        // Erreurs Mongoose
        // Erreur ID invalide
        if (err.name === 'CastError') {
            error = new ValidationError('Ressource non trouvée', 404);
        }

        // Erreur de validation Mongoose
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message);
            error = new ValidationError(message.join(', '), 400);
        }

        // Erreur de duplication (unique)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            error = new ValidationError(`La valeur du champ ${field} existe déjà`, 400);
        }

        // Erreur JWT
        if (err.name === 'JsonWebTokenError') {
            error = new ValidationError('Token invalide', 401);
        }

        // Erreur d'expiration JWT
        if (err.name === 'TokenExpiredError') {
            error = new ValidationError('Token expiré', 401);
        }

        // Réponse formatée
        res.status(error.status || 500).json({
            success: false,
            error: error.message || 'Erreur serveur',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    },

    // Middleware pour les routes non trouvées
    async notFound(req, res, next) {
        const error = new ValidationError(`Route non trouvée - ${req.originalUrl}`, 404);
        next(error);
    },

    // Middleware pour gérer les erreurs async
    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    },

    // Middleware pour gérer les erreurs de validation express
    async validationHandler(err, req, res, next) {
        if (Array.isArray(err)) {
            const errorMessages = err.map(e => e.msg);
            return res.status(400).json({
                success: false,
                error: errorMessages
            });
        }
        next(err);
    }
};

module.exports = errorHandler;