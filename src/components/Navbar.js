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

          {/* User Info */}
          <div className="hidden md:block text-gray-300 px-4">
            {name} ({role}) {/* Display user name and role */}
          </div>

          {/* Hamburger Button on the Right */}
          <div className="md:hidden flex items-center">
            <button 
              className="flex items-center px-3 py-2 rounded text-gray-200 hover:text-white hover:border-white" 
              onClick={toggleMenu}
            >
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                <title>Menu</title>
                <path d="M0 3h20v2H0zm0 6h20v2H0zm0 6h20v2H0z"/>
              </svg>
            </button>
          </div>
                
          {/* Navigation Links for Larger Screens */}
          <div className="hidden md:flex md:justify-between md:items-center md:px-4">
            <div className="flex-grow"></div> {/* Pushes the links to the right */}
            <div className="flex space-x-4">
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
              {isAuthenticated && (
                <button onClick={onLogout} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Logout
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
          Dashboard
        </Link>
        <Link to="/product-list" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
          Products
        </Link>
        <Link to="/add-product" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
          Add Product
        </Link>
        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
          Orders
        </Link>
        <Link to="/users" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
          Users
        </Link>
        {isAuthenticated && (
          <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
