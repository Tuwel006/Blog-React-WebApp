// User Roles
const ROLES = {
    ADMIN: 'admin',
    AUTHOR: 'author',
    VIEWER: 'viewer'
};

// User Status
const USER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

// Permissions by Role
const PERMISSIONS = {
    [ROLES.ADMIN]: [
        'manage_users',
        'manage_posts',
        'manage_comments',
        'view_analytics',
        'approve_users',
        'delete_users'
    ],
    [ROLES.AUTHOR]: [
        'create_post',
        'edit_own_post',
        'delete_own_post',
        'view_own_posts'
    ],
    [ROLES.VIEWER]: [
        'view_posts',
        'add_comment',
        'like_post'
    ]
};

// HTTP Status Codes
const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_ERROR: 500,
    SERVER_ERROR: 500
};

module.exports = {
    ROLES,
    USER_STATUS,
    PERMISSIONS,
    STATUS_CODES
};
