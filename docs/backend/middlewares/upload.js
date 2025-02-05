const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errors');
const { UPLOAD_PATH, MAX_FILE_SIZE } = require('../config/config');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
    // Types MIME autorisés
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ValidationError('Type de fichier non autorisé', 400), false);
    }
};

const upload = {
    // Configuration de base de multer
    config: multer({
        storage: storage,
        limits: {
            fileSize: MAX_FILE_SIZE // Défini dans config.js
        },
        fileFilter: fileFilter
    }),

    // Middleware pour l'upload d'un seul fichier
    single: (fieldName) => {
        return (req, res, next) => {
            upload.config.single(fieldName)(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            error: `Le fichier est trop volumineux. Taille maximale : ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: err.message
                    });
                } else if (err) {
                    return res.status(err.status || 500).json({
                        success: false,
                        error: err.message
                    });
                }
                next();
            });
        };
    },

    // Middleware pour l'upload de plusieurs fichiers
    array: (fieldName, maxCount) => {
        return (req, res, next) => {
            upload.config.array(fieldName, maxCount)(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            error: `Les fichiers sont trop volumineux. Taille maximale : ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: err.message
                    });
                } else if (err) {
                    return res.status(err.status || 500).json({
                        success: false,
                        error: err.message
                    });
                }
                next();
            });
        };
    },

    // Middleware pour l'upload de fichiers dans différents champs
    fields: (fields) => {
        return (req, res, next) => {
            upload.config.fields(fields)(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            error: `Les fichiers sont trop volumineux. Taille maximale : ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: err.message
                    });
                } else if (err) {
                    return res.status(err.status || 500).json({
                        success: false,
                        error: err.message
                    });
                }
                next();
            });
        };
    },

    // Gestion des erreurs d'upload
    handleUploadError: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }
        next(err);
    }
};

module.exports = upload;