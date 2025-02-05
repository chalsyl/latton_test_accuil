const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('../utils/errors');

const userController = {
    // Récupérer tous les utilisateurs (admin uniquement)
    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password');
            
            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Récupérer un utilisateur par son ID
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');

            if (!user) {
                throw new ValidationError('Utilisateur non trouvé');
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Mettre à jour un profil utilisateur
    async updateProfile(req, res) {
        try {
            const { username, email, currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Vérifier si l'email ou le username est déjà utilisé
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: userId } },
                    { $or: [{ email }, { username }] }
                ]
            });

            if (existingUser) {
                throw new ValidationError('Email ou nom d\'utilisateur déjà utilisé');
            }

            const updateData = {
                username,
                email
            };

            // Si un nouveau mot de passe est fourni
            if (newPassword) {
                // Vérifier l'ancien mot de passe
                const user = await User.findById(userId).select('+password');
                const isValid = await bcrypt.compare(currentPassword, user.password);
                
                if (!isValid) {
                    throw new ValidationError('Mot de passe actuel incorrect');
                }

                // Hasher le nouveau mot de passe
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(newPassword, salt);
            }

            // Mettre à jour l'utilisateur
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Supprimer un utilisateur (admin ou propriétaire du compte)
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            // Vérifier si l'utilisateur a les droits
            if (req.user.role !== 'admin' && req.user.id !== userId) {
                throw new ValidationError('Non autorisé');
            }

            await User.findByIdAndDelete(userId);

            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Mettre à jour les préférences utilisateur
    async updatePreferences(req, res) {
        try {
            const { preferences } = req.body;
            const userId = req.user.id;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { preferences },
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = userController;