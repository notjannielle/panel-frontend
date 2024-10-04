import React, { useEffect } from 'react';

const Modal = ({ children, onClose }) => {
  const handleOutsideClick = (event) => {
    // Check if the click is outside of the modal content
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
      <div className="bg-white p-4 rounded shadow-lg">
        <button className="absolute top-0 right-0 m-2 text-gray-600 hover:text-gray-800" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
