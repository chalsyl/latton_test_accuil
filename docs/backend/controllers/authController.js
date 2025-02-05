const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/config');
const { ValidationError } = require('../utils/errors');

const authController = {
    // Inscription d'un nouvel utilisateur
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });

            if (existingUser) {
                throw new ValidationError("Email ou nom d'utilisateur déjà utilisé");
            }

            // Créer le nouvel utilisateur
            const user = await User.create({
                username,
                email,
                password // Le mot de passe sera hashé via le middleware mongoose
            });

            // Générer le token JWT
            const token = jwt.sign(
                { id: user._id },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(201).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Connexion utilisateur
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                throw new ValidationError('Email ou mot de passe incorrect');
            }

            // Vérifier le mot de passe
            const isValid = await bcrypt.compare(password, user.password);
            
            if (!isValid) {
                throw new ValidationError('Email ou mot de passe incorrect');
            }

            // Générer le token JWT
            const token = jwt.sign(
                { id: user._id },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Récupérer l'utilisateur actuel
    async getCurrentUser(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                throw new ValidationError('Utilisateur non trouvé');
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Déconnexion (côté serveur)
    async logout(req, res) {
        try {
            // Ici on pourrait gérer une liste noire de tokens
            // Pour l'instant on renvoie juste un succès
            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = authController;