const Post = require('../models/Post');
const Forum = require('../models/Forum');
const { ValidationError } = require('../utils/errors');

const postController = {
    // Créer un nouveau post
    async createPost(req, res) {
        try {
            const { title, content, forumId } = req.body;

            // Vérifier si le forum existe
            const forum = await Forum.findById(forumId);
            if (!forum) {
                throw new ValidationError('Forum non trouvé');
            }

            const post = await Post.create({
                title,
                content,
                author: req.user.id,
                forum: forumId
            });

            // Mettre à jour les statistiques du forum
            await Forum.findByIdAndUpdate(forumId, {
                $inc: { postsCount: 1 },
                lastPost: post._id,
                lastActivity: Date.now()
            });

            const populatedPost = await Post.findById(post._id)
                .populate('author', 'username')
                .populate('forum', 'title');

            res.status(201).json({
                success: true,
                data: populatedPost
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Récupérer tous les posts d'un forum
    async getForumPosts(req, res) {
        try {
            const { forumId } = req.params;
            const { sort = '-createdAt', page = 1, limit = 20 } = req.query;

            const posts = await Post.find({ forum: forumId })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate('author', 'username')
                .populate('forum', 'title');

            const total = await Post.countDocuments({ forum: forumId });

            res.json({
                success: true,
                data: posts,
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

    // Récupérer un post par son ID
    async getPostById(req, res) {
        try {
            const post = await Post.findById(req.params.id)
                .populate('author', 'username')
                .populate('forum', 'title')
                .populate({
                    path: 'replies',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                });

            if (!post) {
                throw new ValidationError('Post non trouvé');
            }

            // Incrémenter le compteur de vues
            post.views += 1;
            await post.save();

            res.json({
                success: true,
                data: post
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Mettre à jour un post
    async updatePost(req, res) {
        try {
            const { title, content } = req.body;
            const postId = req.params.id;

            const post = await Post.findById(postId);
            
            if (!post) {
                throw new ValidationError('Post non trouvé');
            }

            // Vérifier les permissions
            if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé');
            }

            post.title = title || post.title;
            post.content = content || post.content;
            post.isEdited = true;
            post.editedAt = Date.now();

            await post.save();

            const updatedPost = await Post.findById(postId)
                .populate('author', 'username')
                .populate('forum', 'title');

            res.json({
                success: true,
                data: updatedPost
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Supprimer un post
    async deletePost(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            
            if (!post) {
                throw new ValidationError('Post non trouvé');
            }

            // Vérifier les permissions
            if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé');
            }

            // Mettre à jour les statistiques du forum
            await Forum.findByIdAndUpdate(post.forum, {
                $inc: { postsCount: -1 }
            });

            await post.remove();

            // Mettre à jour le dernier post du forum
            const lastPost = await Post.findOne({ forum: post.forum })
                .sort('-createdAt');

            await Forum.findByIdAndUpdate(post.forum, {
                lastPost: lastPost ? lastPost._id : null,
                lastActivity: lastPost ? lastPost.createdAt : Date.now()
            });

            res.json({
                success: true,
                message: 'Post supprimé avec succès'
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Ajouter une réponse à un post
    async addReply(req, res) {
        try {
            const { content } = req.body;
            const postId = req.params.id;

            const post = await Post.findById(postId);
            if (!post) {
                throw new ValidationError('Post non trouvé');
            }

            const reply = {
                content,
                author: req.user.id,
                createdAt: Date.now()
            };

            post.replies.push(reply);
            post.replyCount = post.replies.length;
            await post.save();

            // Mettre à jour l'activité du forum
            await Forum.findByIdAndUpdate(post.forum, {
                lastActivity: Date.now()
            });

            const updatedPost = await Post.findById(postId)
                .populate('author', 'username')
                .populate('forum', 'title')
                .populate({
                    path: 'replies.author',
                    select: 'username'
                });

            res.json({
                success: true,
                data: updatedPost
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Supprimer une réponse
    async deleteReply(req, res) {
        try {
            const { postId, replyId } = req.params;

            const post = await Post.findById(postId);
            if (!post) {
                throw new ValidationError('Post non trouvé');
            }

            const reply = post.replies.id(replyId);
            if (!reply) {
                throw new ValidationError('Réponse non trouvée');
            }

            // Vérifier les permissions
            if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('Non autorisé');
            }

            reply.remove();
            post.replyCount = post.replies.length;
            await post.save();

            res.json({
                success: true,
                message: 'Réponse supprimée avec succès'
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = postController;