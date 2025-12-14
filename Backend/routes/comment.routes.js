const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    approveComment,
    deleteComment,
    getAllComments
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/acl');
const { ROLES } = require('../config/constants');
const { validateComment, validateMongoId } = require('../middleware/validator');

// Get all comments for admin
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.AUTHOR), getAllComments);

// Get comments for a specific post (public)
router.get('/post/:postId', getComments);

// Add comment to a post (public)
router.post('/post/:postId', validateComment, addComment);

// Approve comment (Admin/Author only)
router.patch(
    '/:id/approve',
    protect,
    authorize(ROLES.ADMIN, ROLES.AUTHOR),
    validateMongoId('id'),
    approveComment
);

// Delete comment (Admin/Author only)
router.delete(
    '/:id',
    protect,
    authorize(ROLES.ADMIN, ROLES.AUTHOR),
    validateMongoId('id'),
    deleteComment
);

module.exports = router;
