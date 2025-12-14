const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    author: {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        }
    },
    content: {
        type: String,
        required: [true, 'Please provide comment content'],
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    approved: {
        type: Boolean,
        default: false
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
