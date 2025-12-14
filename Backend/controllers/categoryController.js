const Category = require('../models/Category');
const { STATUS_CODES } = require('../config/constants');

// @desc    Get all categories with hierarchy
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
    try {
        const { includeInactive = false } = req.query;
        const Post = require('../models/Post');

        const query = includeInactive ? {} : { isActive: true };

        const categories = await Category.find(query)
            .populate('parent', 'name slug')
            .sort({ order: 1, name: 1 })
            .lean();

        // Get post counts for each category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const postCount = await Post.countDocuments({ category: category._id });
                return { ...category, postsCount: postCount };
            })
        );

        res.status(STATUS_CODES.OK).json({
            success: true,
            count: categoriesWithCounts.length,
            categories: categoriesWithCounts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category tree structure
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('postsCount')
            .sort({ order: 1, name: 1 })
            .lean();

        // Build tree structure
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => {
                    if (parentId === null) {
                        return cat.parent === null || cat.parent === undefined;
                    }
                    return cat.parent && cat.parent.toString() === parentId.toString();
                })
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat._id)
                }));
        };

        const tree = buildTree();

        res.status(STATUS_CODES.OK).json({
            success: true,
            tree
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate('parent', 'name slug')
            .populate('children')
            .populate('postsCount');

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
    try {
        const { name, description, parent, order, icon, color } = req.body;

        const category = await Category.create({
            name,
            description,
            parent: parent || null,
            order: order || 0,
            icon,
            color
        });

        const populatedCategory = await Category.findById(category._id)
            .populate('parent', 'name slug');

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: 'Category created successfully',
            category: populatedCategory
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PATCH /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, parent, order, icon, color, isActive } = req.body;

        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check for circular reference if parent is being updated
        if (parent && parent !== 'null') {
            const isDescendant = async (catId, potentialParentId) => {
                if (catId.toString() === potentialParentId.toString()) {
                    return true;
                }
                const cat = await Category.findById(potentialParentId);
                if (!cat || !cat.parent) {
                    return false;
                }
                return isDescendant(catId, cat.parent);
            };

            if (await isDescendant(category._id, parent)) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    message: 'Cannot set a descendant category as parent (circular reference)'
                });
            }
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (parent !== undefined) category.parent = parent === 'null' ? null : parent;
        if (order !== undefined) category.order = order;
        if (icon !== undefined) category.icon = icon;
        if (color) category.color = color;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        category = await Category.findById(category._id)
            .populate('parent', 'name slug');

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has children
        const children = await Category.find({ parent: category._id });
        if (children.length > 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.'
            });
        }

        await category.deleteOne();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reorder categories
// @route   PATCH /api/categories/reorder
// @access  Private/Admin
const reorderCategories = async (req, res, next) => {
    try {
        const { categories } = req.body; // Array of { id, order }

        const updatePromises = categories.map(cat =>
            Category.findByIdAndUpdate(cat.id, { order: cat.order })
        );

        await Promise.all(updatePromises);

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: 'Categories reordered successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryTree,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
};
