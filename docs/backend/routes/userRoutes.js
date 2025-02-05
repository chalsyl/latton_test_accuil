const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { validateUpdateProfile } = require('../utils/validation');
const errorHandler = require('../middlewares/errorHandler');

// Routes protégées
router.use(auth.protect);

// Route pour obtenir tous les utilisateurs (admin uniquement)
router.get('/',
    auth.authorize('admin'),
    errorHandler.asyncHandler(userController.getAllUsers)
);

// Route pour obtenir un utilisateur par son ID
router.get('/:id',
    errorHandler.asyncHandler(userController.getUserById)
);

// Route pour mettre à jour le profil
router.put('/profile',
    validateUpdateProfile,
    upload.single('avatar'),
    errorHandler.asyncHandler(userController.updateProfile)
);

// Route pour mettre à jour les préférences
router.put('/preferences',
    errorHandler.asyncHandler(userController.updatePreferences)
);

// Route pour supprimer un utilisateur
router.delete('/:id',
    errorHandler.asyncHandler(userController.deleteUser)
);

// Route pour l'historique des posts d'un utilisateur
router.get('/:id/posts',
    errorHandler.asyncHandler(userController.getUserPosts)
);

// Route pour les forums suivis
router.get('/me/followed-forums',
    errorHandler.asyncHandler(userController.getFollowedForums)
);

// Route pour suivre/ne plus suivre un forum
router.post('/forums/:forumId/follow',
    errorHandler.asyncHandler(userController.toggleForumFollow)
);

// Route pour les notifications
router.get('/me/notifications',
    errorHandler.asyncHandler(userController.getNotifications)
);

// Route pour marquer les notifications comme lues
router.put('/me/notifications/read',
    errorHandler.asyncHandler(userController.markNotificationsAsRead)
);

// Route pour les statistiques de l'utilisateur
router.get('/:id/stats',
    errorHandler.asyncHandler(userController.getUserStats)
);

// Route pour la réputation de l'utilisateur
router.get('/:id/reputation',
    errorHandler.asyncHandler(userController.getUserReputation)
);

module.exports = router;