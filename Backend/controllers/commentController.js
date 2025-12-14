const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { STATUS_CODES } = require('../config/constants');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getComments = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { approved = true } = req.query;

        const query = { post: postId };

        // Filter by approved status
        if (approved !== 'all') {
            query.approved = approved === 'true';
        }

        const comments = await Comment.find(query)
            .populate('parentComment')
            .sort({ createdAt: -1 });

        res.status(STATUS_CODES.OK).json({
            success: true,
            count: comments.length,
            comments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Public
const addComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { author, content, parentComment } = req.body;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = await Comment.create({
            post: postId,
            author,
            content,
            parentComment: parentComment || null,
            approved: false // Auto-approve can be added based on settings
        });

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: 'Comment submitted successfully. It will be visible after approval.',
            comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve comment
// @route   PATCH /api/comments/:id/approve
// @access  Private/Admin/Author
const approveComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Comment not found'
            });
        }

        comment.approved = true;
        await comment.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Comment approved successfully',
            comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin/Author
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Delete all child comments if this is a parent comment
        await Comment.deleteMany({ parentComment: comment._id });

        // Delete the comment
        await comment.deleteOne();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all comments (for admin)
// @route   GET /api/comments
// @access  Private/Admin
const getAllComments = async (req, res, next) => {
    try {
        const { approved, page = 1, limit = 20 } = req.query;

        const query = {};
        if (approved !== undefined) {
            query.approved = approved === 'true';
        }

        const comments = await Comment.find(query)
            .populate('post', 'title slug')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Comment.countDocuments(query);

        res.status(STATUS_CODES.OK).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            comments
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getComments,
    addComment,
    approveComment,
    deleteComment,
    getAllComments
};
