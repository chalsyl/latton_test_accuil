const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validateRegistration, validateLogin } = require('../utils/validation');
const errorHandler = require('../middlewares/errorHandler');

// Route d'inscription
router.post('/register', 
    validateRegistration,
    errorHandler.asyncHandler(authController.register)
);

// Route de connexion
router.post('/login',
    validateLogin,
    errorHandler.asyncHandler(authController.login)
);

// Route de déconnexion
router.post('/logout',
    auth.protect,
    errorHandler.asyncHandler(authController.logout)
);

// Route pour obtenir l'utilisateur actuel
router.get('/me',
    auth.protect,
    errorHandler.asyncHandler(authController.getCurrentUser)
);

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password',
    errorHandler.asyncHandler(authController.forgotPassword)
);

// Route pour réinitialiser le mot de passe
router.put('/reset-password/:token',
    errorHandler.asyncHandler(authController.resetPassword)
);

// Route pour vérifier l'email
router.get('/verify-email/:token',
    errorHandler.asyncHandler(authController.verifyEmail)
);

// Route pour renvoyer l'email de vérification
router.post('/resend-verification',
    auth.protect,
    errorHandler.asyncHandler(authController.resendVerificationEmail)
);

// Route pour rafraîchir le token
router.post('/refresh-token',
    errorHandler.asyncHandler(authController.refreshToken)
);

module.exports = router;