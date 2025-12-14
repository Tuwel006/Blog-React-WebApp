const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUserStats,
    getAnalytics,
    getTopPosts,
    getCategoryStats,
    getUserDemographics,
    getEngagementMetrics
} = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/acl');
const { ROLES } = require('../config/constants');

// Dashboard stats (Admin only)
router.get('/dashboard', protect, authorize(ROLES.ADMIN), getDashboardStats);

// Analytics data (Admin only)
router.get('/analytics', protect, authorize(ROLES.ADMIN), getAnalytics);

// Top posts (Admin only)
router.get('/top-posts', protect, authorize(ROLES.ADMIN), getTopPosts);

// Category statistics (Admin only)
router.get('/categories', protect, authorize(ROLES.ADMIN), getCategoryStats);

// User demographics (Admin only)
router.get('/demographics', protect, authorize(ROLES.ADMIN), getUserDemographics);

// Engagement metrics (Admin only)
router.get('/engagement', protect, authorize(ROLES.ADMIN), getEngagementMetrics);

// User stats (authenticated users)
router.get('/user/:id?', protect, getUserStats);

module.exports = router;
