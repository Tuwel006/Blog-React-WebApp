const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Please provide content']
    },
    excerpt: {
        type: String,
        maxlength: [300, 'Excerpt cannot be more than 300 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags: [{
        type: String,
        trim: true
    }],
    featuredImage: {
        type: String,
        default: ''
    },
    published: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add text index for search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Create slug from title before saving
postSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Virtual for comments count
postSchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
    count: true
});

module.exports = mongoose.model('Post', postSchema);
