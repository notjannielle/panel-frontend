import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const userData = Cookies.get('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      // Redirect based on role if already logged in
      if (parsedUserData.role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/branch-dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/auth/login`, {
        username,
        password,
      });

      // Store user data and token in cookies
      Cookies.set('userData', JSON.stringify({ 
        name: response.data.user.name, 
        username: response.data.user.username,
        role: response.data.user.role,
        branch: response.data.user.branch
      }));
      Cookies.set('token', response.data.token); // Save the token

      console.log('Login successful:', response.data);

      setIsAuthenticated(true); // Update authentication state

      // Redirect based on user role
      if (response.data.user.role === 'owner') {
        navigate('/dashboard'); // Redirect to owner's dashboard
      } else {
        navigate('/branch-manager/dashboard'); // Redirect to branch manager's dashboard
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg px-10 py-12 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20" />
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center">Escobar Vape Shop - Login Panel</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {error && <p className="text-red-500 text-lg italic mb-6">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline text-lg"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;