import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const BranchEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    category: '',
    image: '',
    price: 0,
    branches: {
      main: [],
      second: [],
      third: [],
      fourth: [],
    },
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const branch = JSON.parse(Cookies.get('userData') || '{}').branch;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (variantIndex, field, value, branch) => {
    setProduct((prev) => {
      const updatedBranches = { ...prev.branches };
      updatedBranches[branch][variantIndex][field] = value;
      return {
        ...prev,
        branches: updatedBranches,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`, product);
      setShowSuccessMessage(true); // Show success message
      setTimeout(() => {
        setShowSuccessMessage(false); // Hide success message after 3 seconds
        navigate('/branch-product-list'); // Redirect to product list after successful edit
      }, 3000);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {showSuccessMessage && (
        <div className="fixed top-0 left-0 w-full bg-green-500 text-white text-center py-2 z-50">
          Product updated successfully!
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Other fields (name, category, image, price) remain the same */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Image URL:</label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleChange}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {product.image && (
            <div className="mt-2">
              <img
                src={product.image}
                alt="Product Preview"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Price:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Variants</h3>
        {product.branches.main.map((variant, index) => (
          <div key={index} className="border border-gray-300 p-4 mb-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700">Variant Name:</label>
            <input
              type="text"
              value={variant.name}
              onChange={(e) => handleVariantChange(index, 'name', e.target.value, 'main')}
              disabled
              className="mt-1 block w-full border border-white rounded-md focus:ring focus:ring-indigo-200"
            />
            <div className="mt-2">
              {branch === 'main' && (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={variant.available}
                    onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'main')}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-600">Main Branch Available</span>
                </label>
              )}
              {branch === 'second' && (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={product.branches.second[index]?.available || false}
                    onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'second')}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-600">Second Branch Available</span>
                </label>
              )}
              {branch === 'third' && (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={product.branches.third[index]?.available || false}
                    onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'third')}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-600">Third Branch Available</span>
                </label>
              )}
             {branch === 'fourth' && (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={product.branches.fourth[index]?.available || false}
                    onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'fourth')}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-600">Fourth Branch Available</span>
                </label>
             )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-150"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default BranchEditProduct;
