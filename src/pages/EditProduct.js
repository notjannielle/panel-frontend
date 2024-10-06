import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const categories = ['Disposables', 'Pods', 'Juices', 'Devices', 'Misc'];

const EditProduct = () => {
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
    },
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageLink, setImageLink] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`);
        setProduct(response.data);
        setImageLink(response.data.image);
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

  const deleteVariant = (variantIndex, branch) => {
    setProduct((prev) => {
      const updatedBranches = { ...prev.branches };
      updatedBranches[branch].splice(variantIndex, 1);
      return {
        ...prev,
        branches: updatedBranches,
      };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!product.name) newErrors.name = "Product name is required.";
    if (!product.category) newErrors.category = "Category is required.";
    if (!imageFile && !imageLink) newErrors.image = "Image is required.";
    if (product.price <= 0) newErrors.price = "Price must be greater than zero.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let imageUrl = product.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else if (imageLink) {
        imageUrl = imageLink;
      }

      const updatedProduct = { ...product, image: imageUrl };
      await axios.put(`${process.env.REACT_APP_ADMIN_SERVER}/api/products/${id}`, updatedProduct);

      setSuccessMessage('Product updated successfully!');
      setTimeout(() => {
        navigate('/product-list');
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCategory = (cat) => {
    setProduct((prev) => ({ ...prev, category: cat }));
    setIsDropdownOpen(false);
  };

  const addVariant = () => {
    setProduct((prev) => ({
      ...prev,
      branches: {
        ...prev.branches,
        main: [...prev.branches.main, { name: '', available: false }],
        second: [...prev.branches.second, { name: '', available: false }],
        third: [...prev.branches.third, { name: '', available: false }],
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {successMessage && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-4 z-50 transition duration-300 ease-in-out">
          {successMessage}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <div className="relative">
            <button
              type="button"
              onClick={toggleDropdown}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
            >
              {product.category || 'Select a category'}
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className="block w-full text-left px-4 py-2 hover:bg-indigo-100"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          <p className="mt-2 text-sm text-gray-600">Or enter image URL:</p>
          <input
            type="url"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            placeholder="Enter image URL"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          {imageLink && (
            <div className="mt-2">
              <img src={imageLink} alt="Preview" className="max-w-full h-auto rounded-md" />
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
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <h3 className="text-xl font-semibold mb-4">Variants</h3>
        {product.branches.main.map((variant, index) => (
          <div key={index} className="border border-gray-300 p-4 mb-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700">Variant Name:</label>
            <input
              type="text"
              value={variant.name}
              onChange={(e) => handleVariantChange(index, 'name', e.target.value, 'main')}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={variant.available}
                  onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'main')}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-600">Main Branch Available</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={product.branches.second[index]?.available || false}
                  onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'second')}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-600">Second Branch Available</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={product.branches.third[index]?.available || false}
                  onChange={(e) => handleVariantChange(index, 'available', e.target.checked, 'third')}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-600">Third Branch Available</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => deleteVariant(index, 'main')}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Delete Variant
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="m-5 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-150"
        >
          Add Variant
        </button>

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

export default EditProduct;
