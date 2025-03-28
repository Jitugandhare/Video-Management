const Video = require('../models/Video.js');
const fs = require('fs');
const path = require('path');

// Upload Video
exports.uploadVideo = async (req, res) => {
    const { title, description } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        const video = new Video({
            title,
            description,
            filePath: req.file.path,
            uploadedBy: req.userId
        });
        await video.save();

        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all videos uploaded by the user
exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.userId });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Stream Video
exports.streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const filePath = path.resolve(video.filePath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Video file not found' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize) {
                return res.status(416).send('Requested range not satisfiable');
            }

            const chunkSize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.uploadedBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this video' });
        }

        if (fs.existsSync(video.filePath)) {
            fs.unlinkSync(video.filePath);
        } else {
            console.warn(`File not found: ${video.filePath}`);
        }

        await video.deleteOne();
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
