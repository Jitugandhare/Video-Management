import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-white">Video Management</div>
      <div className="flex gap-4">
        <Link to="/signup">
          <button className="bg-blue-500 text-black p-2 rounded">Signup</button>
        </Link>
        <Link to="/login">
          <button className="bg-green-500 text-black p-2 rounded">Login</button>
        </Link>
        <Link to="/videos">
          <button className="bg-yellow-500 text-black p-2 rounded">My Videos</button>
        </Link>
      </div>
    </nav>
  );
}
