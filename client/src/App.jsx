import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import Signup from './component/Signup';
import Login from './component/Login';
import UploadVideo from './component/UploadVideo';
import VideoList from './component/VideoList';

function App() {
  return (
    <Router>
      {/* Main container with sidebar */}
      <div className="flex min-h-screen">
        {/* Sidebar component takes 30% of screen width */}
        <div className="w-1/3 bg-gray-800">
          <Sidebar />
        </div>

        {/* Main content area takes the remaining width */}
        <div className="flex-1 bg-gray-50 p-6 w-fit">
          {/* Navbar component takes the remaining width */}
          <div className="bg-white shadow-md mb-6">
            <Navbar />
          </div>

          {/* Main content area */}
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
            <Routes>
              <Route
                path="/signup"
                element={
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <Signup />
                  </div>
                }
              />
              <Route
                path="/login"
                element={
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <Login />
                  </div>
                }
              />
              <Route
                path="/upload"
                element={
                  <div className="bg-teal-50 p-4 rounded-md">
                    <UploadVideo />
                  </div>
                }
              />
              <Route
                path="/videos"
                element={
                  <div className="bg-teal-50 p-4 rounded-md">
                    <VideoList />
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
