// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import Users from './pages/Users';
import EditProduct from './pages/EditProduct';
import Cookies from 'js-cookie';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('userData'));

  // Redirect to dashboard if already authenticated when accessing root
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.location.href = isAuthenticated ? '/dashboard' : '/login';
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Cookies.remove('userData'); // Remove user data from cookies
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="flex-1 p-4 bg-gray-100">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/product-list" element={isAuthenticated ? <ProductList /> : <Navigate to="/login" />} />
            <Route path="/add-product" element={isAuthenticated ? <AddProduct /> : <Navigate to="/login" />} />
            <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} /> {/* Redirect unknown routes */}
            <Route path="/edit-product/:id" element={isAuthenticated ? <EditProduct /> : <Navigate to="/login" />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;