const express = require('express');
const multer = require('multer');
const videoController = require('../controllers/videoController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Video routes
router.post('/upload', authenticate, upload.single('video'), videoController.uploadVideo);
router.get('/', authenticate, videoController.getVideos);
router.get('/stream/:id', authenticate, videoController.streamVideo);
router.delete('/:id', authenticate, videoController.deleteVideo);

module.exports = router;
