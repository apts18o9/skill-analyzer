// client/src/components/Header.jsx (updated)
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useContext(AuthContext); // Use the context to get user and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">
        <Link to="/">Skill Gap Analyzer</Link>
      </div>
      <nav>
        <ul className="flex space-x-4">
          {user ? (
            <>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-blue-500 transition">Profile</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-gray-600 hover:text-blue-500 transition">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-blue-500 transition">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;