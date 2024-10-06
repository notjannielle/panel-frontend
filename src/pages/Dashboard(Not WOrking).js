import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const apiUrl = process.env.REACT_APP_ADMIN_SERVER;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');

        const ordersResponse = await axios.get(`${apiUrl}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const processedOrders = ordersResponse.data.map(order => {
          const orderDate = formatOrderDateTime(order.orderNumber);
          return { ...order, orderDate };
        });

        setOrders(processedOrders);

        const productsResponse = await axios.get(`${apiUrl}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatOrderDateTime = (orderNumber) => {
    const numberPart = orderNumber.replace('ORD-', '');
    const year = `20${numberPart.substring(0, 2)}`;
    const month = numberPart.substring(2, 4) - 1; // Month is 0-indexed
    const day = numberPart.substring(4, 6);
    const hour = numberPart.substring(6, 8);
    const minute = numberPart.substring(8, 10);
    const second = numberPart.substring(10, 12);
    return new Date(year, month, day, hour, minute, second);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Prepare data for branch statistics
  const branchStatistics = {};
  orders.forEach(order => {
    if (!branchStatistics[order.branch]) {
      branchStatistics[order.branch] = { totalOrders: 0, totalSales: 0, averageOrderValue: 0, orderCounts: [] };
    }
    branchStatistics[order.branch].totalOrders++;
    branchStatistics[order.branch].totalSales += order.total;
    branchStatistics[order.branch].orderCounts.push(order.total);
  });

  Object.keys(branchStatistics).forEach(branch => {
    const stats = branchStatistics[branch];
    stats.averageOrderValue = (stats.totalSales / stats.totalOrders).toFixed(2);
  });

  // Function to get orders by time frame
  const getOrdersByTimeFrame = (timeFrame) => {
    const ordersByBranch = {};
    orders.forEach(order => {
      const branch = order.branch;
      const date = order.orderDate;

      if (!ordersByBranch[branch]) {
        ordersByBranch[branch] = {
          daily: 0,
          weekly: 0,
          monthly: 0,
          quarterly: 0
        };
      }

      const today = new Date();
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = today.getFullYear() * 12 + today.getMonth() - (date.getFullYear() * 12 + date.getMonth());
      const diffQuarters = Math.floor(diffMonths / 3);

      if (timeFrame === 'daily') ordersByBranch[branch].daily++;
      if (timeFrame === 'weekly' && diffDays < 7) ordersByBranch[branch].weekly++;
      if (timeFrame === 'monthly' && diffMonths === 0) ordersByBranch[branch].monthly++;
      if (timeFrame === 'quarterly' && diffQuarters === 0) ordersByBranch[branch].quarterly++;
    });
    return ordersByBranch;
  };

  const ordersDaily = getOrdersByTimeFrame('daily');
  const ordersWeekly = getOrdersByTimeFrame('weekly');
  const ordersMonthly = getOrdersByTimeFrame('monthly');
  const ordersQuarterly = getOrdersByTimeFrame('quarterly');

  // Prepare chart data
  const branchNames = Object.keys(branchStatistics);
  const dailyData = branchNames.map(branch => ordersDaily[branch]?.daily || 0);
  const weeklyData = branchNames.map(branch => ordersWeekly[branch]?.weekly || 0);
  const monthlyData = branchNames.map(branch => ordersMonthly[branch]?.monthly || 0);
  const quarterlyData = branchNames.map(branch => ordersQuarterly[branch]?.quarterly || 0);

  const dailyChartData = {
    labels: branchNames,
    datasets: [{
      label: 'Daily Orders',
      data: dailyData,
      backgroundColor: '#42A5F5',
    }],
  };

  const weeklyChartData = {
    labels: branchNames,
    datasets: [{
      label: 'Weekly Orders',
      data: weeklyData,
      backgroundColor: '#66BB6A',
    }],
  };

  const monthlyChartData = {
    labels: branchNames,
    datasets: [{
      label: 'Monthly Orders',
      data: monthlyData,
      backgroundColor: '#FFCE56',
    }],
  };

  const quarterlyChartData = {
    labels: branchNames,
    datasets: [{
      label: 'Quarterly Orders',
      data: quarterlyData,
      backgroundColor: '#FF6384',
    }],
  };

  return (
    <div className="flex flex-col p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Total Orders: {totalOrders}</h2>
          <h2 className="text-xl font-semibold">Total Revenue: ₱{totalRevenue}</h2>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Total Items Sold: {orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branchNames.map(branch => (
          <div className="bg-white shadow-md rounded-lg p-4" key={branch}>
            <h2 className="text-xl font-semibold">{branch}</h2>
            <p>Total Orders: {branchStatistics[branch].totalOrders}</p>
            <p>Total Sales: ₱{branchStatistics[branch].totalSales.toFixed(2)}</p>
            <p>Average Order Value: ₱{branchStatistics[branch].averageOrderValue}</p>
            <p>Daily Orders: {ordersDaily[branch]?.daily || 0}</p>
            <p>Weekly Orders: {ordersWeekly[branch]?.weekly || 0}</p>
            <p>Monthly Orders: {ordersMonthly[branch]?.monthly || 0}</p>
            <p>Quarterly Orders: {ordersQuarterly[branch]?.quarterly || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Daily Orders by Branch</h2>
          <Bar data={dailyChartData} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Weekly Orders by Branch</h2>
          <Bar data={weeklyChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Monthly Orders by Branch</h2>
          <Bar data={monthlyChartData} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold">Quarterly Orders by Branch</h2>
          <Bar data={quarterlyChartData} />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold">Available Products</h2>
        <p>{products.reduce((count, product) => count + product.branches.main.filter(v => v.available).length, 0)} products available</p>
      </div>
    </div>
  );
};

export default Dashboard;
