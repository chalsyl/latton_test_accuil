const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre du forum est requis'],
        unique: true,
        trim: true,
        minlength: [3, 'Le titre doit faire au moins 3 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description du forum est requise'],
        trim: true,
        minlength: [10, 'La description doit faire au moins 10 caractères'],
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    category: {
        type: String,
        required: [true, 'La catégorie est requise'],
        enum: {
            values: ['general', 'technology', 'gaming', 'sports', 'entertainment', 'education', 'other'],
            message: 'Catégorie non valide'
        }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'archived', 'private'],
        default: 'active'
    },
    rules: [{
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }],
    postsCount: {
        type: Number,
        default: 0
    },
    subscribersCount: {
        type: Number,
        default: 0
    },
    subscribers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        subscribedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    settings: {
        allowImages: {
            type: Boolean,
            default: true
        },
        allowPolls: {
            type: Boolean,
            default: true
        },
        allowAnonymousPosts: {
            type: Boolean,
            default: false
        },
        requireModeration: {
            type: Boolean,
            default: false
        },
        restrictedToVerified: {
            type: Boolean,
            default: false
        }
    },
    banList: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        bannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bannedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour la recherche
forumSchema.index({ title: 'text', description: 'text' });

// Virtuals
forumSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'forum',
    justOne: false
});

// Méthodes du modèle
forumSchema.methods = {
    // Vérifier si un utilisateur est modérateur
    isModerator(userId) {
        return this.moderators.some(modId => modId.toString() === userId.toString());
    },

    // Vérifier si un utilisateur est banni
    isBanned(userId) {
        const ban = this.banList.find(ban => 
            ban.user.toString() === userId.toString() && 
            (!ban.expiresAt || ban.expiresAt > Date.now())
        );
        return !!ban;
    },

    // Vérifier si un utilisateur est abonné
    isSubscribed(userId) {
        return this.subscribers.some(sub => sub.user.toString() === userId.toString());
    }
};

// Middleware pre-save
forumSchema.pre('save', function(next) {
    // Mettre à jour lastActivity lors de la création
    if (this.isNew) {
        this.lastActivity = Date.now();
    }
    next();
});

module.exports = mongoose.model('Forum', forumSchema);