const mongoose = require('mongoose');
const Post = require('../models/Post');
const { STATUS_CODES } = require('../config/constants');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res, next) => {
    try {
        const { category, tag, search, page = 1, limit = 10, published } = req.query;

        const query = {};

        // Filter by published status only if explicitly provided
        if (published !== undefined && published !== '') {
            query.published = published === 'true';
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by tag
        if (tag) {
            query.tags = { $in: [tag] };
        }

        // Search in title and content
        if (search) {
            query.$text = { $search: search };
        }

        let sort = { createdAt: -1 };
        let projection = {};

        if (search) {
            projection = { score: { $meta: 'textScore' } };
            sort = { score: { $meta: 'textScore' } };
        }

        const posts = await Post.find(query, projection)
            .populate('author', 'name email avatar')
            .populate('category', 'name slug color')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

        const count = await Post.countDocuments(query);

        res.status(STATUS_CODES.OK).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            posts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post by ID or slug
// @route   GET /api/posts/:identifier
// @access  Public
const getPost = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let post;

        // Check if identifier is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            post = await Post.findById(identifier)
                .populate('author', 'name email avatar bio')
                .populate('category', 'name slug color');
        }

        // If not found by ID (or not a valid ID), try by slug
        if (!post) {
            post = await Post.findOne({ slug: identifier })
                .populate('author', 'name email avatar bio')
                .populate('category', 'name slug color');
        }

        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private/Admin/Author
const createPost = async (req, res, next) => {
    try {
        const { title, content, excerpt, category, tags, featuredImage, published } = req.body;

        const post = await Post.create({
            title,
            content,
            excerpt,
            category,
            tags,
            featuredImage,
            published: published !== undefined ? published : true,
            author: req.user._id
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name email avatar')
            .populate('category', 'name slug color');

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: 'Post created successfully',
            post: populatedPost
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update post
// @route   PATCH /api/posts/:id
// @access  Private/Admin/Author (own posts)
const updatePost = async (req, res, next) => {
    try {
        const { title, content, excerpt, category, tags, featuredImage, published } = req.body;

        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (category !== undefined) post.category = category;
        if (tags !== undefined) post.tags = tags;
        if (featuredImage !== undefined) post.featuredImage = featuredImage;
        if (published !== undefined) post.published = published;

        await post.save();

        post = await Post.findById(post._id)
            .populate('author', 'name email avatar')
            .populate('category', 'name slug color');

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Admin/Author (own posts)
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        await post.deleteOne();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent posts
// @route   GET /api/posts/recent
// @access  Public
const getRecentPosts = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;

        const posts = await Post.find({ published: true })
            .populate('author', 'name avatar')
            .populate('category', 'name slug color')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(STATUS_CODES.OK).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get popular posts (by views)
// @route   GET /api/posts/popular
// @access  Public
const getPopularPosts = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;

        const posts = await Post.find({ published: true })
            .populate('author', 'name avatar')
            .populate('category', 'name slug color')
            .sort({ views: -1 })
            .limit(parseInt(limit));

        res.status(STATUS_CODES.OK).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Increment post views
// @route   POST /api/posts/:id/view
// @access  Public
const incrementViews = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            views: post.views
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Public
const toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Simple increment for now (can be enhanced with user tracking)
        post.likes += 1;
        await post.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            likes: post.likes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getRecentPosts,
    getPopularPosts,
    incrementViews,
    toggleLike
};
