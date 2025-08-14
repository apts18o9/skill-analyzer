
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'


const ProfilePage = () => {


  const { user, loading, updateProfile } = useContext(AuthContext)
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    currentSkills: [],
    desiredRoles: []
  });

  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    //to protect profile from unauthor user
    if (!loading && !user) {
      navigate('/login')
    }

    if (user) {
      setProfileData({
        currentSkills: user.currentSkills || [],
        desiredRoles: user.desiredRoles || []
      })
    }
  }, [user, loading, navigate])


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Split input string by comma to get an array
    setProfileData(prevData => ({
      ...prevData,
      [name]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };


  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData)
      setStatusMessage('Profile updated successfully');
    } catch (error) {
        setStatusMessage('Failed to update the profile. Try again')
    }
  };

  //showing loading screen while fetching details

  if(loading){
    return <div className='text-center py-20'>Loading Profile...</div>
  }

  if(!user){
    return null;
  }


  return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Profile</h2>
                <p className="text-gray-700">Username: <span className="font-semibold">{user.username}</span></p>
                <p className="text-gray-700 mb-6">Email: <span className="font-semibold">{user.email}</span></p>
    
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Update Skills & Roles</h3>
                {statusMessage && <p className="mb-4 text-sm font-bold text-green-600">{statusMessage}</p>}
    
                <form onSubmit={handleUpdateSubmit} className="mb-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="currentSkills">
                            Your Current Skills (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="currentSkills"
                            name="currentSkills"
                            value={profileData.currentSkills.join(', ')}
                            onChange={handleInputChange}
                            placeholder="e.g., React, Node.js, Python"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="desiredRoles">
                            Your Desired Roles (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="desiredRoles"
                            name="desiredRoles"
                            value={profileData.desiredRoles.join(', ')}
                            onChange={handleInputChange}
                            placeholder="e.g., Frontend Developer, DevOps Engineer"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;