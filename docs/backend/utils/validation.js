const { body, param, query } = require('express-validator');

const validation = {
    // Validation de l'inscription
    validateRegistration: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Le nom d\'utilisateur doit faire entre 3 et 30 caractères')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
        
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail(),
        
        body('password')
            .isLength({ min: 6 })
            .withMessage('Le mot de passe doit faire au moins 6 caractères')
            .matches(/\d/)
            .withMessage('Le mot de passe doit contenir au moins un chiffre')
    ],

    // Validation de la connexion
    validateLogin: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail(),
        
        body('password')
            .notEmpty()
            .withMessage('Le mot de passe est requis')
    ],

    // Validation de la création d'un forum
    validateForumCreate: [
        body('title')
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Le titre doit faire entre 3 et 100 caractères'),
        
        body('description')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('La description doit faire entre 10 et 500 caractères'),
        
        body('category')
            .isIn(['general', 'technology', 'gaming', 'sports', 'entertainment', 'education', 'other'])
            .withMessage('Catégorie invalide')
    ],

    // Validation de la mise à jour d'un forum
    validateForumUpdate: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Le titre doit faire entre 3 et 100 caractères'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('La description doit faire entre 10 et 500 caractères')
    ],

    // Validation de la création d'un post
    validatePost: [
        body('title')
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Le titre doit faire entre 3 et 200 caractères'),
        
        body('content')
            .trim()
            .isLength({ min: 10, max: 50000 })
            .withMessage('Le contenu doit faire entre 10 et 50000 caractères'),
        
        body('forumId')
            .isMongoId()
            .withMessage('ID de forum invalide')
    ],

    // Validation de la mise à jour du profil
    validateUpdateProfile: [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Le nom d\'utilisateur doit faire entre 3 et 30 caractères'),
        
        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail(),
        
        body('bio')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('La bio ne peut pas dépasser 500 caractères')
    ],

    // Validation des paramètres de pagination
    validatePagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Le numéro de page doit être un entier positif'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('La limite doit être entre 1 et 100')
    ],

    // Validation des IDs MongoDB
    validateMongoId: [
        param('id')
            .isMongoId()
            .withMessage('ID invalide')
    ],

    // Validation des réponses
    validateReply: [
        body('content')
            .trim()
            .isLength({ min: 1, max: 10000 })
            .withMessage('Le contenu doit faire entre 1 et 10000 caractères')
    ]
};

module.exports = validation;