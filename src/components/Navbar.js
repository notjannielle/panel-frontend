import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import Cookies

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get user data from cookies
  const userData = JSON.parse(Cookies.get('userData') || '{}');
  const { name, role } = userData;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Return null if not authenticated to hide navbar on login page
  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white">
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-lg font-bold px-4 py-2">
            Admin Panel
          </Link>
        </div>
        <div className="hidden md:block text-gray-300 px-4">
          {name} ({role})
        </div>
        <div className="flex space-x-4">
          {role === 'branch manager' ? (
            <>
              <Link to="/product-list" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Products
              </Link>
              <Link to="/branch-orders" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
  Branch Orders
</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/product-list" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Products
              </Link>
              <Link to="/add-product" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Add Product
              </Link>
              <Link to="/orders" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Orders
              </Link>
              <Link to="/users" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Users
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button onClick={onLogout} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;
