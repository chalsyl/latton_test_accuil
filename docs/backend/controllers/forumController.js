const Forum = require('../models/Forum');
const Post = require('../models/Post');
const { ValidationError } = require('../utils/errors');

const forumController = {
    // Créer un nouveau forum
    async createForum(req, res) {
        try {
            const { title, description, category } = req.body;

            // Vérifier si un forum avec le même titre existe déjà
            const existingForum = await Forum.findOne({ title });
            if (existingForum) {
                throw new ValidationError('Un forum avec ce titre existe déjà');
            }

            const forum = await Forum.create({
                title,
                description,
                category,
                creator: req.user.id
            });

            res.status(201).json({
                success: true,
                data: forum
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Récupérer tous les forums
    async getAllForums(req, res) {
        try {
            const { category, sort = '-updatedAt', page = 1, limit = 10 } = req.query;
            
            const query = {};
            if (category) query.category = category;

            const forums = await Forum.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate('creator', 'username');

            const total = await Forum.countDocuments(query);

            res.json({
                success: true,
                data: forums,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Récupérer un forum par son ID
    async getForumById(req, res) {
        try {
            const forum = await Forum.findById(req.params.id)
                .populate('creator', 'username')
                .populate({
                    path: 'lastPost',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                });

            if (!forum) {
                throw new ValidationError('Forum non trouvé');
            }

            res.json({
                success: true,
                data: forum
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Mettre à jour un forum
    async updateForum(req, res) {
        try {
            const { title, description, category } = req.body;
            const forumId = req.params.id;

            // Vérifier si l'utilisateur est le créateur ou admin
            const forum = await Forum.findById(forumId);
            if (!forum) {
                throw new ValidationError('Forum non trouvé');
            }

            if (forum.creator.toString() !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé');
            }

            // Vérifier si le nouveau titre est déjà utilisé
            if (title && title !== forum.title) {
                const existingForum = await Forum.findOne({ title });
                if (existingForum) {
                    throw new ValidationError('Un forum avec ce titre existe déjà');
                }
            }

            const updatedForum = await Forum.findByIdAndUpdate(
                forumId,
                { title, description, category },
                { new: true, runValidators: true }
            ).populate('creator', 'username');

            res.json({
                success: true,
                data: updatedForum
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Supprimer un forum
    async deleteForum(req, res) {
        try {
            const forum = await Forum.findById(req.params.id);
            
            if (!forum) {
                throw new ValidationError('Forum non trouvé');
            }

            // Vérifier les permissions
            if (forum.creator.toString() !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé');
            }

            // Supprimer tous les posts associés
            await Post.deleteMany({ forum: req.params.id });

            // Supprimer le forum
            await forum.remove();

            res.json({
                success: true,
                message: 'Forum supprimé avec succès'
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Mettre à jour les statistiques du forum
    async updateForumStats(req, res) {
        try {
            const forumId = req.params.id;
            
            const postsCount = await Post.countDocuments({ forum: forumId });
            const lastPost = await Post.findOne({ forum: forumId })
                .sort('-createdAt')
                .populate('author', 'username');

            const updatedForum = await Forum.findByIdAndUpdate(
                forumId,
                {
                    postsCount,
                    lastPost: lastPost ? lastPost._id : null,
                    lastActivity: lastPost ? lastPost.createdAt : Date.now()
                },
                { new: true }
            );

            res.json({
                success: true,
                data: updatedForum
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = forumController;