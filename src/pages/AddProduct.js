import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = ['Disposables', 'Pods', 'Juices', 'Devices', 'Misc'];

const AddProduct = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageLink, setImageLink] = useState('');
  const [price, setPrice] = useState('');
  const [variants, setVariants] = useState([{ name: '', available: { main: false, second: false, third: false } }]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors

    const newErrors = {};
    if (!name) newErrors.name = "Product name is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!price) newErrors.price = "Price is required.";
    if (!imageFile && !imageLink) newErrors.image = "Image is required."; // Check for image

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission if there are errors
    }

    const branches = {
      main: variants.map(variant => ({
        name: variant.name,
        available: variant.available.main,
      })),
      second: variants.map(variant => ({
        name: variant.name,
        available: variant.available.second,
      })),
      third: variants.map(variant => ({
        name: variant.name,
        available: variant.available.third,
      })),
    };

    let imageUrl = imageLink; // Default to image link if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      imageUrl = response.data.url; // Get uploaded image URL
    }

    const newProduct = {
      name,
      category,
      image: imageUrl,
      price: parseFloat(price),
      branches,
    };

    try {
      await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/products`, newProduct);
      setConfirmationMessage('Product added successfully!');
      setTimeout(() => {
        setConfirmationMessage('');
        navigate('/product-list');
      }, 3000);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      if (field === 'name') {
        updatedVariants[index].name = value;
      } else {
        updatedVariants[index].available = {
          ...updatedVariants[index].available,
          ...value,
        };
      }
      return updatedVariants;
    });
  };

  const deleteVariant = (variantIndex) => {
    setVariants(prevVariants => prevVariants.filter((_, index) => index !== variantIndex));
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', available: { main: false, second: false, third: false } }]);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCategory = (cat) => {
    setCategory(cat);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {confirmationMessage && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-4 z-50 transition duration-300 ease-in-out">
          {confirmationMessage}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Product Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              {category || 'Select a category'}
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
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>} {/* Error for image */}
          {imageLink && (
            <div className="mt-2">
              <img src={imageLink} alt="Preview" className="max-w-full h-auto rounded-md" />
            </div>
          )}
          <p className="mt-2 text-sm text-gray-600">Or enter image URL:</p>
          <input
            type="url"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            placeholder="Enter image URL (optional)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <h2 className="text-lg font-bold mb-4">Variants</h2>
        {variants.map((variant, index) => (
          <div key={index} className="mb-4 border p-4 rounded shadow-sm">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Variant Name:</label>
              <input
                type="text"
                value={variant.name}
                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
              />
            </div>

            <h3 className="font-medium text-gray-700 mb-2">Availability:</h3>
            <div className="flex space-x-4">
              {['main', 'second', 'third'].map(branch => (
                <div key={branch}>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={variant.available[branch]}
                      onChange={(e) => handleVariantChange(index, 'available', { [branch]: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring focus:ring-indigo-200"
                    />
                    <span className="ml-2 capitalize">{branch} Branch</span>
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => deleteVariant(index)}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Delete Variant
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-150"
        >
          Add Variant
        </button>

        <button
          type="submit"
          className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-150"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
