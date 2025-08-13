import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Discover Your Learning Path
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Analyze your skill gaps against desired career roles and get a personalized learning plan to bridge the difference.
      </p>
      <div className="space-x-4">
        <Link 
          to="/register" 
          className="bg-blue-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-600 transition"
        >
          Get Started
        </Link>
        <Link 
          to="/login" 
          className="text-blue-500 px-8 py-3 rounded-md text-lg font-semibold border-2 border-blue-500 hover:bg-blue-50 transition hover:text-blue-600"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default HomePage;