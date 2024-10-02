// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const userData = Cookies.get('userData'); // Get user data from cookies

  // Check if user is logged in
  if (!userData) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  return children; // Render the protected route
};

export default ProtectedRoute;
