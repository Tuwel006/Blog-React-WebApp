const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { STATUS_CODES, USER_STATUS } = require('../config/constants');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();
        const pendingUsers = await User.countDocuments({ status: USER_STATUS.PENDING });
        const pendingComments = await Comment.countDocuments({ approved: false });
        const publishedPosts = await Post.countDocuments({ published: true });

        // Get total views and likes
        const viewsResult = await Post.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

        const likesResult = await Post.aggregate([
            { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
        ]);
        const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentPosts = await Post.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const recentComments = await Comment.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get top posts by views
        const topPosts = await Post.find()
            .select('title slug views likes createdAt')
            .populate('author', 'name')
            .sort({ views: -1 })
            .limit(5);

        // Get recent posts
        const recentPostsList = await Post.find()
            .select('title slug published createdAt')
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get pending items for admin attention
        const pendingItems = {
            users: await User.find({ status: USER_STATUS.PENDING })
                .select('name email role createdAt')
                .sort({ createdAt: -1 })
                .limit(5),
            comments: await Comment.find({ approved: false })
                .select('author.name content post createdAt')
                .populate('post', 'title')
                .sort({ createdAt: -1 })
                .limit(5)
        };

        res.status(STATUS_CODES.OK).json({
            success: true,
            stats: {
                overview: {
                    totalUsers,
                    totalPosts,
                    totalComments,
                    totalViews,
                    totalLikes,
                    publishedPosts,
                    pendingUsers,
                    pendingComments
                },
                recentActivity: {
                    posts: recentPosts,
                    users: recentUsers,
                    comments: recentComments
                },
                topPosts,
                recentPosts: recentPostsList,
                pendingItems
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/stats/user/:id
// @access  Private
const getUserStats = async (req, res, next) => {
    try {
        const userId = req.params.id || req.user._id;

        const totalPosts = await Post.countDocuments({ author: userId });
        const publishedPosts = await Post.countDocuments({ author: userId, published: true });
        const draftPosts = await Post.countDocuments({ author: userId, published: false });

        const viewsResult = await Post.aggregate([
            { $match: { author: userId } },
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

        const likesResult = await Post.aggregate([
            { $match: { author: userId } },
            { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
        ]);
        const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

        res.status(STATUS_CODES.OK).json({
            success: true,
            stats: {
                totalPosts,
                publishedPosts,
                draftPosts,
                totalViews,
                totalLikes
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get analytics data with time range
// @route   GET /api/stats/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
    try {
        const { range = '7d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (range) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 7);
        }

        // Get daily stats for the range
        const dailyStats = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    posts: { $sum: 1 },
                    views: { $sum: '$views' },
                    likes: { $sum: '$likes' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Get user registration stats
        const userStats = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    users: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                range,
                dailyStats,
                userStats
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get top performing posts
// @route   GET /api/stats/top-posts
// @access  Private/Admin
const getTopPosts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        
        const topPosts = await Post.find({ published: true })
            .select('title slug views likes createdAt')
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ views: -1 })
            .limit(parseInt(limit));

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: topPosts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category statistics
// @route   GET /api/stats/categories
// @access  Private/Admin
const getCategoryStats = async (req, res, next) => {
    try {
        const categoryStats = await Post.aggregate([
            { $match: { published: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$category',
                    name: { $first: '$categoryInfo.name' },
                    postCount: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' }
                }
            },
            { $sort: { postCount: -1 } }
        ]);

        const totalPosts = await Post.countDocuments({ published: true });
        
        // Calculate percentages
        const categoriesWithPercentage = categoryStats.map(cat => ({
            ...cat,
            percentage: Math.round((cat.postCount / totalPosts) * 100)
        }));

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: categoriesWithPercentage
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user demographics
// @route   GET /api/stats/demographics
// @access  Private/Admin
const getUserDemographics = async (req, res, next) => {
    try {
        // Get user role distribution
        const roleStats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get user status distribution
        const statusStats = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get new vs returning users (simplified)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        const totalUsers = await User.countDocuments();
        const returningUsers = totalUsers - newUsers;

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                roleStats,
                statusStats,
                userTypes: {
                    new: newUsers,
                    returning: returningUsers,
                    newPercentage: Math.round((newUsers / totalUsers) * 100),
                    returningPercentage: Math.round((returningUsers / totalUsers) * 100)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get engagement metrics
// @route   GET /api/stats/engagement
// @access  Private/Admin
const getEngagementMetrics = async (req, res, next) => {
    try {
        const { range = '7d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (range) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            default:
                startDate.setDate(endDate.getDate() - 7);
        }

        // Get engagement stats
        const totalPosts = await Post.countDocuments({
            published: true,
            createdAt: { $gte: startDate, $lte: endDate }
        });
        
        const totalViews = await Post.aggregate([
            {
                $match: {
                    published: true,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        
        const totalLikes = await Post.aggregate([
            {
                $match: {
                    published: true,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$likes' } } }
        ]);
        
        const totalComments = await Comment.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const views = totalViews.length > 0 ? totalViews[0].total : 0;
        const likes = totalLikes.length > 0 ? totalLikes[0].total : 0;
        
        // Calculate engagement rate (likes + comments / views)
        const engagementRate = views > 0 ? ((likes + totalComments) / views * 100).toFixed(1) : 0;
        
        // Mock additional metrics (in real app, these would come from analytics service)
        const metrics = {
            engagementRate: `${engagementRate}%`,
            clickThroughRate: '4.2%',
            avgSessionDuration: '2:45',
            bounceRate: '78%',
            totalViews: views,
            totalLikes: likes,
            totalComments
        };

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: metrics
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getUserStats,
    getAnalytics,
    getTopPosts,
    getCategoryStats,
    getUserDemographics,
    getEngagementMetrics
};
