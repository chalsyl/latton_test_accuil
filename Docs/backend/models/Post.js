const mongoose = require('mongoose');

// Sous-schéma pour les réponses
const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Le contenu de la réponse est requis'],
        trim: true,
        minlength: [1, 'Le contenu doit faire au moins 1 caractère'],
        maxlength: [10000, 'Le contenu ne peut pas dépasser 10000 caractères']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    attachments: [{
        filename: String,
        path: String,
        mimetype: String
    }]
}, {
    timestamps: true
});

// Schéma principal pour les posts
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre du post est requis'],
        trim: true,
        minlength: [3, 'Le titre doit faire au moins 3 caractères'],
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    content: {
        type: String,
        required: [true, 'Le contenu du post est requis'],
        trim: true,
        minlength: [10, 'Le contenu doit faire au moins 10 caractères'],
        maxlength: [50000, 'Le contenu ne peut pas dépasser 50000 caractères']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    forum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true
    },
    type: {
        type: String,
        enum: ['normal', 'announcement', 'poll'],
        default: 'normal'
    },
    status: {
        type: String,
        enum: ['active', 'locked', 'hidden', 'moderated'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    replies: [replySchema],
    replyCount: {
        type: Number,
        default: 0
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    poll: {
        question: String,
        options: [{
            text: String,
            votes: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                votedAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        expiresAt: Date,
        allowMultipleVotes: {
            type: Boolean,
            default: false
        }
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    lastActivity: {
        type: Date,
        default: Date.now
    },
    moderationInfo: {
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        reason: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
postSchema.index({ forum: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Middleware pre-save
postSchema.pre('save', function(next) {
    // Mettre à jour replyCount
    if (this.replies) {
        this.replyCount = this.replies.length;
    }

    // Mettre à jour lastActivity
    this.lastActivity = Date.now();

    next();
});

// Méthodes du modèle
postSchema.methods = {
    // Vérifier si un utilisateur a voté dans un sondage
    hasVoted(userId) {
        if (!this.poll) return false;
        return this.poll.options.some(option =>
            option.votes.some(vote => vote.user.toString() === userId.toString())
        );
    },

    // Vérifier si un utilisateur a liké le post
    isLiked(userId) {
        return this.likes.some(like => like.user.toString() === userId.toString());
    },

    // Obtenir le résultat du sondage
    getPollResults() {
        if (!this.poll) return null;

        const totalVotes = this.poll.options.reduce((sum, option) => 
            sum + option.votes.length, 0);

        return {
            totalVotes,
            options: this.poll.options.map(option => ({
                text: option.text,
                votes: option.votes.length,
                percentage: totalVotes ? (option.votes.length / totalVotes * 100).toFixed(1) : 0
            }))
        };
    }
};

// Virtuals
postSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

module.exports = mongoose.model('Post', postSchema);