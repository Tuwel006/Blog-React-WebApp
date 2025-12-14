const { ROLES, PERMISSIONS, STATUS_CODES, USER_STATUS } = require('../config/constants');

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Check if user's status is approved
        if (req.user.status !== USER_STATUS.APPROVED) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: 'Your account is pending approval. Please contact an administrator.'
            });
        }

        // Check if user has the required role
        if (!roles.includes(req.user.role)) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user has specific permission
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const userPermissions = PERMISSIONS[req.user.role] || [];

        if (!userPermissions.includes(permission)) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

// Check if user owns the resource
const checkOwnership = (Model, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Admins can access any resource
            if (req.user.role === ROLES.ADMIN) {
                return next();
            }

            // Check if user owns the resource
            const ownerId = resource.author || resource.user || resource._id;
            if (ownerId.toString() !== req.user._id.toString()) {
                return res.status(STATUS_CODES.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to access this resource'
                });
            }

            next();
        } catch (error) {
            return res.status(STATUS_CODES.INTERNAL_ERROR).json({
                success: false,
                message: 'Error checking ownership',
                error: error.message
            });
        }
    };
};

module.exports = {
    authorize,
    checkPermission,
    checkOwnership
};
