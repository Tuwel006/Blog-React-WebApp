const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Controller methods
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct public URL
    // Assuming server serves 'uploads' directory at /uploads
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
        message: 'File uploaded successfully',
        url: fileUrl,
        filename: req.file.filename
    });
};

exports.getMediaLibrary = (req, res) => {
    const uploadDir = 'uploads/';

    if (!fs.existsSync(uploadDir)) {
        return res.status(200).json({ media: [] });
    }

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan files' });
        }

        const protocol = req.protocol;
        const host = req.get('host');

        const mediaFiles = files.map(file => {
            return {
                filename: file,
                url: `${protocol}://${host}/uploads/${file}`,
                uploadedAt: fs.statSync(path.join(uploadDir, file)).birthtime
            };
        }).sort((a, b) => b.uploadedAt - a.uploadedAt); // Newest first

        res.status(200).json({ media: mediaFiles });
    });
};

// Export the multer middleware to be used in routes
exports.uploadMiddleware = upload.single('image');
