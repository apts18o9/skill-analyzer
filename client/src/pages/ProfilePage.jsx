import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const { user, token } = useContext(AuthContext);

  const [currentSkills, setCurrentSkills] = useState([]);
  const [desiredRoles, setDesiredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        const res = await axios.get('http://localhost:5000/api/users/profile', config);

        setCurrentSkills(res.data.currentSkills || []);
        setDesiredRoles(res.data.desiredRoles || []);

      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err.response || err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const body = { currentSkills, desiredRoles };
      const res = await axios.put('http://localhost:5000/api/users/profile', body, config);
      alert('Profile updated successfully!');
      console.log(res.data);
    } catch (err) {
      alert('Failed to update profile.');
      console.error(err);
    }
  };

  const handleAnalyzeText = async (e) => {
    e.preventDefault();
    if (!analysisText.trim()) {
      alert('Please enter text to analyze.');
      return;
    }

    setIsAnalyzing(true)

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.post('http://localhost:5000/api/analyze/text', { text: analysisText }, config);

      setCurrentSkills(res.data.skills || []);
      setDesiredRoles(res.data.roles || []);

      alert('Text analyzed successfully! Your profile has been updated.');
    } catch (err) {
      alert('Failed to analyze text.');
      console.error(err);
    }finally{
      setIsAnalyzing(false)
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-screen">Loading profile...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800">User Profile</h2>
        <p className="text-lg text-gray-600 mt-2">Welcome, {user?.username}!</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Your Profile Data</h3>
        <div className="mb-4">
          <p className="font-bold text-gray-600">Current Skills:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentSkills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
            ))}
            {currentSkills.length === 0 && <span className="text-gray-500">None</span>}
          </div>
        </div>
        <div>
          <p className="font-bold text-gray-600">Desired Roles:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {desiredRoles.map((role, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{role}</span>
            ))}
            {desiredRoles.length === 0 && <span className="text-gray-500">None</span>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Manual Profile Update</h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Current Skills:</label>
            <input
              type="text"
              value={currentSkills.join(', ')}
              onChange={(e) => setCurrentSkills(e.target.value.split(',').map(s => s.trim()))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Desired Roles:</label>
            <input
              type="text"
              value={desiredRoles.join(', ')}
              onChange={(e) => setDesiredRoles(e.target.value.split(',').map(r => r.trim()))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
          type="submit" 
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Update Profile
            </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">AI-Powered Analysis</h3>
        <form onSubmit={handleAnalyzeText}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Paste Resume/Job Description:</label>
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              rows="8"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button type="submit"
          disabled={isAnalyzing}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
            {isAnalyzing ? 'Analyzing' : 'Analyze Text and Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;