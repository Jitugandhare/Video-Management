// VideoList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/videos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideos(response.data);
      } catch (err) {
        setError(err.response.data.message);
      }
    };

    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVideos(videos.filter((video) => video.id !== id));
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold">Your Videos</h2>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4">
        {videos.map((video) => (
          <div key={video._id} className="border-b py-4">
            <h3 className="font-semibold">{video.title}</h3>
            <p>{video.description}</p>
            <button
              onClick={() => handleDelete(video._id)}
              className="bg-red-500 text-black p-2 rounded mt-2"
            >
              Delete
            </button>
            <a
              href={`http://localhost:5000/videos/stream/${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 bg-blue-300 text-black p-2 rounded"
            >
              Watch
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
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
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        console.log(token)

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        console.log('Received Token:', token); // Debugging

        const decoded = jwt.verify(token, 'jitu');

        req.user = { _id: decoded.id }; // Assign decoded user ID to request

        console.log('Decoded Token:', decoded); // Debugging

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};
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
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);

// Database connection
mongoose.connect('mongodb://localhost:27017/video-app').then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
// Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful');
      navigate('/videos');
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={handleLogin} className="mt-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mt-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mt-2 border border-gray-300 rounded"
        />
        <button type="submit" className="w-full p-2 mt-4 bg-green-500 text-black rounded">
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
