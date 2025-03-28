import React from 'react';
import { Button } from '../components/ui/button'; // Make sure Button component is properly imported
import { Upload, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/upload');  // Navigate to UploadVideo component
  };

  const handleVideosClick = () => {
    navigate('/videos');  // Navigate to VideoList component
  };

  return (
    <aside className="w-full bg-gray-800 p-6 flex flex-col gap-4">
      <div className="text-2xl font-bold text-white">Video Management</div>
      <Button className="bg-gray-700 flex items-center gap-2 text-black" onClick={handleUploadClick}>
        <Upload className="w-4 h-4" /> Upload
      </Button>
      <Button className="bg-gray-700 flex items-center gap-2 text-black" onClick={handleVideosClick}>
        <Video className="w-4 h-4" /> Videos
      </Button>
    </aside>
  );
}
