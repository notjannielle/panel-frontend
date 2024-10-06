import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // Success message state

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        setSuccessMessage('Product deleted successfully!'); // Set success message
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleBackup = async () => {
    const response = await fetch(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/backup`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formattedDate = now.toLocaleString('en-CA', options).replace(/\/|,| /g, '-').replace(/:/g, '-');

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `products_backup_${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRestoreConfirmation = () => {
    const confirmRestore = window.confirm('Are you sure you want to upload this product file? This will replace any product information you have.');
    if (confirmRestore && file) {
      handleRestore();
    }
  };

  const handleRestore = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchProducts();
      setFile(null);
      setSuccessMessage('Products restored successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error restoring products:', error);
      setSuccessMessage('Failed to restore products.');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {successMessage && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-4 z-50 transition duration-300 ease-in-out">
          {successMessage}
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">Product List</h1>
      <Link to="/add-product" className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Add Product</Link>

      {/* Backup and Restore Buttons */}
      <div className="mb-4 flex justify-end">
        <button onClick={handleBackup} className="bg-green-500 text-white px-2 py-2 rounded mr-2">
          Download Backup
        </button>
        <input
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          onClick={handleRestoreConfirmation}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload Products
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
        <thead>
          <tr className="w-full bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6">Product Image</th>
            <th className="py-3 px-6">Product Name</th>
            <th className="py-3 px-6">Category</th>
            <th className="py-3 px-6">Price</th>
            <th className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {products.map(product => (
            <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6">
                <img src={product.image} alt={product.name} className="h-16 w-16 object-cover" />
              </td>
              <td className="py-3 px-6">{product.name}</td>
              <td className="py-3 px-6">{product.category}</td>
              <td className="py-3 px-6">₱{product.price}</td>
              <td className="py-3 px-6">
                <Link
                  to={`/edit-product/${product._id}`}
                  className="inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-150"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="inline-block bg-red-500 text-white font-semibold py-2 px-4 rounded ml-4 hover:bg-red-600 transition duration-150"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
