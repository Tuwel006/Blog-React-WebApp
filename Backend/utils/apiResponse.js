/**
 * Standardized API Response Utilities
 * Provides consistent response format across all endpoints
 */

class ApiResponse {
    /**
     * Success response
     * @param {Object} res - Express response object
     * @param {Number} statusCode - HTTP status code
     * @param {String} message - Success message
     * @param {Object} data - Response data
     */
    static success(res, statusCode = 200, message = 'Success', data = {}) {
        return res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Error response
     * @param {Object} res - Express response object
     * @param {Number} statusCode - HTTP status code
     * @param {String} message - Error message
     * @param {Array} errors - Array of detailed errors
     */
    static error(res, statusCode = 500, message = 'An error occurred', errors = []) {
        return res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Created response (201)
     */
    static created(res, message = 'Resource created successfully', data = {}) {
        return this.success(res, 201, message, data);
    }

    /**
     * No content response (204)
     */
    static noContent(res) {
        return res.status(204).send();
    }

    /**
     * Bad request response (400)
     */
    static badRequest(res, message = 'Bad request', errors = []) {
        return this.error(res, 400, message, errors);
    }

    /**
     * Unauthorized response (401)
     */
    static unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, 401, message);
    }

    /**
     * Forbidden response (403)
     */
    static forbidden(res, message = 'Forbidden - You do not have permission') {
        return this.error(res, 403, message);
    }

    /**
     * Not found response (404)
     */
    static notFound(res, message = 'Resource not found') {
        return this.error(res, 404, message);
    }

    /**
     * Conflict response (409)
     */
    static conflict(res, message = 'Resource already exists') {
        return this.error(res, 409, message);
    }

    /**
     * Validation error response (422)
     */
    static validationError(res, errors = []) {
        return this.error(res, 422, 'Validation failed', errors);
    }

    /**
     * Internal server error response (500)
     */
    static serverError(res, message = 'Internal server error') {
        return this.error(res, 500, message);
    }

    /**
     * Paginated response
     */
    static paginated(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages,
                hasNextPage: pagination.page < pagination.totalPages,
                hasPrevPage: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = ApiResponse;
