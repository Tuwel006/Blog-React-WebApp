const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    toggleBookmark
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/acl');
const { ROLES } = require('../config/constants');
const { validateMongoId } = require('../middleware/validator');

// Protect all routes
router.use(protect);

// Bookmark route (Any authenticated user)
router.post('/bookmarks/:postId', ...validateMongoId('postId'), toggleBookmark);

// Admin only routes
router.use(authorize(ROLES.ADMIN));

router.get('/', getAllUsers);
router.get('/pending', getPendingUsers);
router.patch('/:id/approve', ...validateMongoId('id'), approveUser);
router.patch('/:id/reject', ...validateMongoId('id'), rejectUser);
router.patch('/:id', ...validateMongoId('id'), updateUser);
router.delete('/:id', ...validateMongoId('id'), deleteUser);

module.exports = router;
