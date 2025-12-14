const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/acl');

// Upload image (Protected: Author & Admin)
router.post('/upload', protect, authorize('admin', 'author'), mediaController.uploadMiddleware, mediaController.uploadImage);

// Get media library (Protected: Author & Admin)
router.get('/', protect, authorize('admin', 'author'), mediaController.getMediaLibrary);

module.exports = router;
