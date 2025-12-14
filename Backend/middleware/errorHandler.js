const { STATUS_CODES } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');

// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    let statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
    let message = err.message || 'Internal Server Error';
    let errors = [];

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = STATUS_CODES.BAD_REQUEST;
        message = 'Invalid ID format';
        errors = [{ field: err.path, message: `Invalid ${err.path}` }];
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = STATUS_CODES.CONFLICT;
        const field = Object.keys(err.keyValue)[0];
        message = 'Duplicate value error';
        errors = [{
            field,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            value: err.keyValue[field]
        }];
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
        message = 'Validation failed';
        errors = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message,
            kind: error.kind,
            value: error.value
        }));
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = STATUS_CODES.UNAUTHORIZED;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = STATUS_CODES.UNAUTHORIZED;
        message = 'Token expired';
    }

    // Express validator errors
    if (err.array && typeof err.array === 'function') {
        statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
        message = 'Validation failed';
        errors = err.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
        }));
    }

    return ApiResponse.error(res, statusCode, message, errors);
};

// 404 handler
const notFoundHandler = (req, res) => {
    return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = {
    errorHandler,
    notFoundHandler
};
