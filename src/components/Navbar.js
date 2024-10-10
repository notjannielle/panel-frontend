import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  // Get user data from cookies
  const userData = JSON.parse(Cookies.get('userData') || '{}');
  const { name, role } = userData;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle clicks outside of the dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Return null if not authenticated to hide navbar on login page
  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-900">
            Escobar Vape Cartel - Admin Panel
          </span>
        </div>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            onClick={toggleMenu}
            type="button"
            className="flex text-sm rounded-full focus:ring-4 focus:ring-gray-300"
            id="user-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="user-dropdown"
          >
            <span className="sr-only">Open user menu</span>
            <img className="w-8 h-8 rounded-full" src="/logo.png" alt="user photo" />
          </button>
          {/* Dropdown menu */}
          <div
            ref={dropdownRef} // Attach the ref to the dropdown
            className={`absolute right-0 top-12 z-50 ${isMenuOpen ? '' : 'hidden'} my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow`}
            id="user-dropdown"
          >
            <div className="px-4 py-3">
              <span className="block text-sm text-gray-900">{name}</span>
              <span className="block text-sm text-gray-500 truncate">{role}</span>
            </div>
            <ul className="py-2">
              <li>
                <button onClick={onLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            {role === 'branch manager' ? (
              <>
                <li>
                  <Link to="/branch-product-list" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/branch-orders-v2" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Branch Orders
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                </li>
                <li>
                  <Link to="/dashboard" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/product-list" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/add-product" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Orders
                  </Link>
                </li>
              {/*  <li>
                  <Link to="/users" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">
                    Users
                  </Link>
                </li> */}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
