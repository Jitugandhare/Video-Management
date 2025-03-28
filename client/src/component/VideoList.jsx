import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError(err.response?.data?.message || 'Failed to fetch videos');
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
      setVideos(videos.filter((video) => video._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-3xl font-bold text-purple-600">Your Videos</h2>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <div className="mt-4">
        {videos.map((video) => (
          <div key={video._id} className="border-b py-4">
            <h3 className="text-xl font-semibold text-gray-700">{video.title}</h3>
            <p className="text-gray-600">{video.description}</p>
            <div className="mt-2 flex items-center">
              <button
                onClick={() => handleDelete(video._id)}
                className="bg-orange-500 text-black p-2 rounded mt-2 hover:bg-orange-600"
              >
                Delete
              </button>
              <a
                href={`http://localhost:5000/videos/stream/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
                 className="ml-4 bg-white-700 text-black p-2 rounded mt-2 hover:bg-green-200"
              >
                Watch
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
