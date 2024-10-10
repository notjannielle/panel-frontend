import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    canceledOrders: 0,
    preparingOrders: 0,
    readyForPickupOrders: 0,
    orderReceived: 0,
    branchAnalytics: {
      main: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
      second: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
      third: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
    },
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentDate, setCurrentDate] = useState('');

  const fetchAnalytics = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = response.data;
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      setCurrentDate(today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));

      const filteredOrders = orders.filter(order => {
        const orderNumber = order.orderNumber;
        const strippedOrderNumber = orderNumber.slice(4);
        const orderYear = strippedOrderNumber.slice(0, 2);
        const orderMonth = strippedOrderNumber.slice(2, 4);
        const orderDay = strippedOrderNumber.slice(4, 6);
        return orderYear === year && orderMonth === month && orderDay === day;
      });

      const branchAnalytics = {
        main: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
        second: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
        third: { totalOrders: 0, totalRevenue: 0, completedOrders: 0, canceledOrders: 0, preparingOrders: 0, readyForPickupOrders: 0, orderReceived: 0 },
      };

      filteredOrders.forEach(order => {
        const branch = order.branch;

        if (branchAnalytics[branch]) {
          branchAnalytics[branch].totalOrders += 1;

          if (order.status === 'Picked Up') {
            branchAnalytics[branch].totalRevenue += order.total;
            branchAnalytics[branch].completedOrders += 1;
          } else if (order.status === 'Canceled') {
            branchAnalytics[branch].canceledOrders += 1;
          } else if (order.status === 'Preparing') {
            branchAnalytics[branch].preparingOrders += 1;
          } else if (order.status === 'Ready for Pickup') {
            branchAnalytics[branch].readyForPickupOrders += 1;
          } else if (order.status === 'Order Received') {
            branchAnalytics[branch].orderReceived += 1;
          }
        }
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.status === 'Picked Up' ? order.total : 0), 0);
      const totalOrders = filteredOrders.length;

      setAnalytics(prev => ({
        ...prev,
        totalOrders,
        totalRevenue,
        branchAnalytics,
      }));

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching orders for analytics', error);
    }
  };

  useEffect(() => {
    fetchAnalytics(); 
    const intervalId = setInterval(fetchAnalytics, 900000); 

    return () => clearInterval(intervalId); 
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Order Analytics Dashboard</h1>
      <p className="text-gray-600 mb-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      <p className="text-gray-600 mb-4">Current Date: {currentDate}</p>
      


      {/* Total Analytics for All Branches */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Total Analytics Today - All Branch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Total Orders</h3>
            <p className="text-4xl font-bold text-indigo-600">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-4xl font-bold text-indigo-600">₱{analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Completed Orders</h3>
            <p className="text-4xl font-bold text-green-600">{analytics.completedOrders}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Canceled Orders</h3>
            <p className="text-4xl font-bold text-red-600">{analytics.canceledOrders}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Preparing Orders</h3>
            <p className="text-4xl font-bold text-yellow-600">{analytics.preparingOrders}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Ready for Pickup Orders</h3>
            <p className="text-4xl font-bold text-blue-600">{analytics.readyForPickupOrders}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">Order Received</h3>
            <p className="text-4xl font-bold text-purple-600">{analytics.orderReceived}</p>
          </div>
        </div>
      </div>
      <hr class="border-t-2 border-gray-300 my-4"></hr>

      {Object.entries(analytics.branchAnalytics).map(([branch, data]) => (
        <div key={branch} className="mt-10">
          <h2 className="text-2xl font-bold mb-4">{branch.charAt(0).toUpperCase() + branch.slice(1)} Branch Analytics Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Total Orders</h3>
              <p className="text-4xl font-bold text-indigo-600">{data.totalOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Total Revenue</h3>
              <p className="text-4xl font-bold text-indigo-600">₱{data.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Completed Orders</h3>
              <p className="text-4xl font-bold text-green-600">{data.completedOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Canceled Orders</h3>
              <p className="text-4xl font-bold text-red-600">{data.canceledOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Preparing Orders</h3>
              <p className="text-4xl font-bold text-yellow-600">{data.preparingOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Ready for Pickup Orders</h3>
              <p className="text-4xl font-bold text-blue-600">{data.readyForPickupOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700">Order Received</h3>
              <p className="text-4xl font-bold text-purple-600">{data.orderReceived}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
