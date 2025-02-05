const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middlewares/auth');
const { validateForumCreate, validateForumUpdate } = require('../utils/validation');
const errorHandler = require('../middlewares/errorHandler');

// Routes publiques
router.get('/',
    errorHandler.asyncHandler(forumController.getAllForums)
);

router.get('/:id',
    errorHandler.asyncHandler(forumController.getForumById)
);

// Routes protégées
router.use(auth.protect);

// Création d'un forum (admin uniquement)
router.post('/',
    auth.authorize('admin'),
    validateForumCreate,
    errorHandler.asyncHandler(forumController.createForum)
);

// Mise à jour d'un forum
router.put('/:id',
    auth.isOwner,
    validateForumUpdate,
    errorHandler.asyncHandler(forumController.updateForum)
);

// Suppression d'un forum
router.delete('/:id',
    auth.isOwner,
    errorHandler.asyncHandler(forumController.deleteForum)
);

// Gestion des modérateurs
router.post('/:id/moderators',
    auth.authorize('admin'),
    errorHandler.asyncHandler(forumController.addModerator)
);

router.delete('/:id/moderators/:userId',
    auth.authorize('admin'),
    errorHandler.asyncHandler(forumController.removeModerator)
);

// Gestion des règles
router.post('/:id/rules',
    auth.isOwner,
    errorHandler.asyncHandler(forumController.addRule)
);

router.put('/:id/rules/:ruleId',
    auth.isOwner,
    errorHandler.asyncHandler(forumController.updateRule)
);

router.delete('/:id/rules/:ruleId',
    auth.isOwner,
    errorHandler.asyncHandler(forumController.deleteRule)
);

// Gestion des bannissements
router.post('/:id/bans',
    auth.authorize('admin', 'moderator'),
    errorHandler.asyncHandler(forumController.banUser)
);

router.delete('/:id/bans/:userId',
    auth.authorize('admin', 'moderator'),
    errorHandler.asyncHandler(forumController.unbanUser)
);

// Statistiques du forum
router.get('/:id/stats',
    errorHandler.asyncHandler(forumController.getForumStats)
);

// Mise à jour des paramètres du forum
router.put('/:id/settings',
    auth.isOwner,
    errorHandler.asyncHandler(forumController.updateForumSettings)
);

// Liste des utilisateurs bannis
router.get('/:id/bans',
    auth.authorize('admin', 'moderator'),
    errorHandler.asyncHandler(forumController.getBannedUsers)
);

// Recherche dans le forum
router.get('/:id/search',
    errorHandler.asyncHandler(forumController.searchInForum)
);

module.exports = router;