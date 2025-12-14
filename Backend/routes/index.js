const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');
const statsRoutes = require('./stats.routes');
const categoryRoutes = require('./category.routes');
const mediaRoutes = require('./media.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/stats', statsRoutes);
router.use('/categories', categoryRoutes);
router.use('/media', mediaRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
