const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const User = require('../models/User');
const { ValidationError } = require('../utils/errors');

const auth = {
    // Vérifier si l'utilisateur est authentifié
    async protect(req, res, next) {
        try {
            let token;

            // Vérifier si le token est présent dans les headers
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                throw new ValidationError('Non autorisé - Token manquant', 401);
            }

            try {
                // Vérifier le token
                const decoded = jwt.verify(token, JWT_SECRET);

                // Récupérer l'utilisateur
                const user = await User.findById(decoded.id).select('-password');

                if (!user) {
                    throw new ValidationError('Utilisateur non trouvé', 404);
                }

                // Ajouter l'utilisateur à la requête
                req.user = user;
                next();
            } catch (error) {
                throw new ValidationError('Non autorisé - Token invalide', 401);
            }
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Vérifier les rôles
    authorize(...roles) {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Non autorisé - Droits insuffisants'
                });
            }
            next();
        };
    },

    // Vérifier si l'utilisateur est propriétaire de la ressource
    async isOwner(req, res, next) {
        try {
            const resourceId = req.params.id;
            const userId = req.user.id;
            const resourceType = req.baseUrl.split('/')[2]; // ex: /api/posts -> posts

            let resource;
            switch (resourceType) {
                case 'posts':
                    resource = await Post.findById(resourceId);
                    break;
                case 'forums':
                    resource = await Forum.findById(resourceId);
                    break;
                // Ajouter d'autres cas selon les besoins
                default:
                    throw new ValidationError('Type de ressource non supporté');
            }

            if (!resource) {
                throw new ValidationError('Ressource non trouvée');
            }

            const ownerId = resource.author || resource.creator || resource.user;
            if (ownerId.toString() !== userId && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé - Vous n\'êtes pas le propriétaire', 403);
            }

            next();
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = auth;