// Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /product-list when the component mounts
    navigate('/product-list');
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
    </div>
  );
};

export default Dashboard;
