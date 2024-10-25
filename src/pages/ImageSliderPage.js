import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ImageSliderPage = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/slider-images`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_ADMIN_SERVER}/api/slider-images/upload`, formData);
      const newImage = { url: response.data.url };
      setImages((prevImages) => [...prevImages, newImage]);
      setFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDelete = (imageUrl) => {
    setImageToDelete(imageUrl);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_ADMIN_SERVER}/api/slider-images`, { data: { url: imageToDelete } });
      setImages(images.filter((image) => image.url !== imageToDelete));
      setShowConfirmation(false);
      setImageToDelete(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Image Slider</h1>

      {uploadSuccess && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center">
          Image uploaded successfully!
        </div>
      )}

      {deleteSuccess && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center">
          Image deleted successfully!
        </div>
      )}

      <div className="flex justify-center mb-4 mt-16">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-l-lg p-2 w-2/3"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white rounded-r-lg px-4 hover:bg-blue-600"
        >
          Upload
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg shadow-lg">
            <img
              src={image.url}
              alt={`Slide ${index}`}
              className="w-full h-48 object-cover transition-transform transform hover:scale-105"
            />
            <button
              onClick={() => handleDelete(image.url)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4">Are you sure you want to delete this image?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSliderPage;
