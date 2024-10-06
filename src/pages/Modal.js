import React, { useEffect } from 'react';

const Modal = ({ children, onClose }) => {
  const handleOutsideClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 modal-overlay">
      <div className="bg-white p-4 rounded shadow-lg w-11/12 max-w-2xl"> {/* Tailwind classes for width */}
        <button className="absolute top-0 right-0 m-2 text-gray-600 hover:text-gray-800" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
