const { body, param, validationResult } = require('express-validator');
const { STATUS_CODES } = require('../config/constants');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User validation rules
const validateRegister = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Post validation rules
const validatePost = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('content')
        .notEmpty()
        .withMessage('Content is required'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    handleValidationErrors
];

// Comment validation rules
const validateComment = [
    body('author.name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    body('author.email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters'),
    handleValidationErrors
];

// Category validation rules
const validateCategory = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required'),
    handleValidationErrors
];

// MongoDB ID validation
const validateMongoId = (paramName = 'id') => {
    return [
        param(paramName)
            .isMongoId()
            .withMessage('Invalid ID format'),
        handleValidationErrors
    ];
};

module.exports = {
    validateRegister,
    validateLogin,
    validatePost,
    validateComment,
    validateCategory,
    validateMongoId,
    handleValidationErrors
};
