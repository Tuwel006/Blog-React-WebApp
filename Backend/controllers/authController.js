const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { STATUS_CODES, ROLES, USER_STATUS } = require('../config/constants');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(STATUS_CODES.CONFLICT).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create user (authors and admins require approval)
        const needsApproval = role === ROLES.ADMIN || role === ROLES.AUTHOR;
        const user = await User.create({
            name,
            email,
            password,
            role: role || ROLES.VIEWER,
            status: needsApproval ? USER_STATUS.PENDING : USER_STATUS.APPROVED
        });

        // If needs approval, don't send token
        if (needsApproval) {
            return res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: 'Registration successful. Your account is pending approval.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        }

        // Send token for regular viewers
        const token = generateToken(user._id);

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: 'Registration successful',
            token,
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log("step1: User found", user.email);
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        console.log("step2: Password match result:", isMatch);
        if (!isMatch) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is approved
        if (user.status !== USER_STATUS.APPROVED) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: 'Your account is pending approval. Please contact an administrator.'
            });
        }

        // Create token
        const token = generateToken(user._id);

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                bio: user.bio
            }
        });

    } catch (error) {
        console.log("step", error);

        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(STATUS_CODES.OK).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Request admin/author access
// @route   POST /api/auth/request-access
// @access  Public
const requestAccess = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(STATUS_CODES.CONFLICT).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create user with pending status
        const user = await User.create({
            name,
            email,
            password,
            role: role || ROLES.AUTHOR,
            status: USER_STATUS.PENDING
        });

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: 'Access request submitted successfully. Please wait for admin approval.',
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    requestAccess,
    logout
};
