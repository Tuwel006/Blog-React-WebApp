const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryTree,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/acl');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:slug', getCategory);

// Protected routes - Admin only
router.post('/', protect, authorize(ROLES.ADMIN), createCategory);
router.patch('/reorder', protect, authorize(ROLES.ADMIN), reorderCategories);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCategory);

module.exports = router;
