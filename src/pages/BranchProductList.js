import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const BranchProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const branch = JSON.parse(Cookies.get('userData') || '{}').branch;

  useEffect(() => {
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

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
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
      <h1 className="text-xl font-bold mb-4">Product List</h1>
     
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
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
              </td>
              <td className="py-3 px-6">{product.name}</td>
              <td className="py-3 px-6">{product.category}</td>
              <td className="py-3 px-6">₱{product.price}</td>
              <td className="py-3 px-6">
                {branch && (
                  <>
                    <Link to={`/branch-edit-product/${product._id}`}>
                      <button className="text-blue-500 bg-transparent hover:bg-blue-100 border border-blue-500 hover:text-blue-700 font-semibold py-1 px-2 rounded">
                        Edit Stock
                      </button>
                    </Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchProductList;
