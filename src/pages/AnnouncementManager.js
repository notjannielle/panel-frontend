import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AnnouncementManager = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the announcement
  const fetchAnnouncement = async () => {
    const token = Cookies.get('token');
    try {
      const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/announcement`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setAnnouncement(response.data);
        setMessage(response.data.message);
        setEnabled(response.data.enabled);
        setStatusMessage(response.data.enabled ? 'Announcement is enabled' : 'Announcement is disabled');
      } else {
        resetAnnouncementState();
      }
    } catch (error) {
      handleFetchError(error);
    }
  };

  // Reset announcement state
  const resetAnnouncementState = () => {
    setAnnouncement(null);
    setMessage('');
    setEnabled(false);
    setStatusMessage('');
  };

  // Handle fetch error
  const handleFetchError = (error) => {
    if (error.response?.status === 404) {
      resetAnnouncementState();
      console.warn('No announcement found, please create one.');
    } else {
      console.error('Error fetching announcement:', error.response ? error.response.data : error.message);
      setError('Failed to fetch announcement.');
    }
  };

  // Update announcement message
  const handleUpdateMessage = (e) => {
    setMessage(e.target.value);
  };

  // Toggle enabled status
  const handleToggleEnabled = async (e) => {
    const newEnabledStatus = e.target.checked;
    setEnabled(newEnabledStatus);
    setStatusMessage(newEnabledStatus ? 'Enabling announcement...' : 'Disabling announcement...');

    const token = Cookies.get('token');
    try {
      await axios.put(
        `${process.env.REACT_APP_ADMIN_SERVER}/api/announcement`,
        { message, enabled: newEnabledStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Announcement status updated successfully!');
      setStatusMessage(newEnabledStatus ? 'Announcement is enabled' : 'Announcement is disabled');
    } catch (error) {
      setError('Error updating enabled status: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  // Update announcement message on save
  const handleUpdateAnnouncement = async () => {
    const token = Cookies.get('token');
    try {
      await axios.put(
        `${process.env.REACT_APP_ADMIN_SERVER}/api/announcement`,
        { message, enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Announcement updated successfully!');
      fetchAnnouncement();
    } catch (error) {
      setError('Error updating announcement: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  // Fetch announcement on mount
  useEffect(() => {
    fetchAnnouncement();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Announcement Manager</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {statusMessage && <p className="text-blue-500 mb-4">{statusMessage}</p>}

      <form className="mb-4">
        <textarea
          value={message}
          onChange={handleUpdateMessage}
          placeholder="Enter your announcement here..."
          className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows="4"
          required
        />
        <div className="flex items-center mt-4">
          <span className="mr-2 text-sm font-medium text-gray-700">Enabled</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              className="sr-only"
            />
            <div className="toggle-bg w-10 h-5 bg-gray-200 rounded-full shadow-inner"></div>
            <div className={`toggle-dot absolute w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ease-in-out ${enabled ? 'transform translate-x-5' : 'translate-x-0'}`}></div>
          </label>
        </div>
        <button
          type="button"
          onClick={handleUpdateAnnouncement}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-150"
        >
          Update Announcement
        </button>
      </form>

      {announcement && (
        <div className="bg-white shadow-md rounded-lg p-4 mt-6">
          <h2 className="font-bold text-xl">Current Announcement</h2>
          <p className="text-gray-800 mt-2">{announcement.message}</p>
          <span className="text-gray-500 text-sm">
            Status: {announcement.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;
