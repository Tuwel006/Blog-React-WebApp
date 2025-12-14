const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    icon: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#1e3a8a' // Navy blue
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name before saving
categorySchema.pre('save', async function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Calculate level based on parent
    if (this.parent) {
        const parentCategory = await this.constructor.findById(this.parent);
        if (parentCategory) {
            this.level = parentCategory.level + 1;
        }
    } else {
        this.level = 0;
    }

    next();
});

// Virtual for children
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for posts count
categorySchema.virtual('postsCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'categories',
    count: true
});

module.exports = mongoose.model('Category', categorySchema);
