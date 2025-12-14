const express = require('express');
const router = express.Router();
const {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getRecentPosts,
    getPopularPosts,
    incrementViews,
    toggleLike
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { authorize, checkOwnership } = require('../middleware/acl');
const { ROLES } = require('../config/constants');
const { validatePost, validateMongoId } = require('../middleware/validator');
const Post = require('../models/Post');

// Public routes
router.get('/', getAllPosts);
router.get('/recent', getRecentPosts);
router.get('/popular', getPopularPosts);
router.get('/:identifier', getPost);
router.post('/:id/view', incrementViews);
router.post('/:id/like', toggleLike);

// Protected routes - Create post (Admin & Author)
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.AUTHOR), validatePost, createPost);

// Protected routes - Update/Delete (Admin or Owner)
router.patch(
    '/:id',
    protect,
    authorize(ROLES.ADMIN, ROLES.AUTHOR),
    validateMongoId('id'),
    checkOwnership(Post, 'id'),
    validatePost,
    updatePost
);

router.delete(
    '/:id',
    protect,
    authorize(ROLES.ADMIN, ROLES.AUTHOR),
    validateMongoId('id'),
    checkOwnership(Post, 'id'),
    deletePost
);

module.exports = router;
