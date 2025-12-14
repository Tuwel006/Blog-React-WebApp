const User = require('../models/User');
const { STATUS_CODES, USER_STATUS } = require('../config/constants');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const { status, role, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.status(STATUS_CODES.OK).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending user requests
// @route   GET /api/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ status: USER_STATUS.PENDING })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(STATUS_CODES.OK).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve user
// @route   PATCH /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = USER_STATUS.APPROVED;
        await user.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'User approved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject user
// @route   PATCH /api/users/:id/reject
// @access  Private/Admin
const rejectUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = USER_STATUS.REJECTED;
        await user.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'User rejected successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, status } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle bookmark
// @route   POST /api/users/bookmarks/:postId
// @access  Private
const toggleBookmark = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const postId = req.params.postId;

        if (user.bookmarks.includes(postId)) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
        } else {
            user.bookmarks.push(postId);
        }

        await user.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            bookmarks: user.bookmarks
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    toggleBookmark
};
