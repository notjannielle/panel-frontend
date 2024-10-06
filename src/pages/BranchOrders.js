import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from './Modal'; // Ensure the path is correct

const BranchOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notification, setNotification] = useState('');
  const ordersPerPage = 10;
  const branch = JSON.parse(Cookies.get('userData') || '{}').branch; // Get branch from user data

  // State to manage current pages for each status
  const [currentPageByStatus, setCurrentPageByStatus] = useState({});

  useEffect(() => {
    const fetchBranchOrders = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredOrders = response.data.filter(order => order.branch === branch);
        setOrders(filteredOrders);

        // Initialize current pages for each status
        const initialPages = {};
        const statusPriority = ['Order Received', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Canceled'];
        statusPriority.forEach(status => {
          initialPages[status] = 1;
        });
        setCurrentPageByStatus(initialPages);
      } catch (error) {
        console.error('Error fetching branch orders', error);
      }
    };

    fetchBranchOrders();
  }, [branch]);

  const formatOrderDateTime = (orderNumber) => {
    const numberPart = orderNumber.replace('ORD-', '');
    const year = `20${numberPart.substring(0, 2)}`;
    const month = numberPart.substring(2, 4);
    const day = numberPart.substring(4, 6);
    const hour = numberPart.substring(6, 8);
    const minute = numberPart.substring(8, 10);
    const second = numberPart.substring(10, 12);
    const dateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const branchAddresses = {
    main: 'Main Branch - Piy Margal',
    second: 'Second Branch - Honradez',
    third: 'Third Branch - G. Tuazon',
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (selectedOrder) {
      const confirmed = window.confirm(`Are you sure you want to change the status to "${newStatus}"?`);
      if (confirmed) {
        try {
          const token = Cookies.get('token');
          await axios.put(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders/${selectedOrder._id}/status`, { status: newStatus }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOrders(prevOrders => prevOrders.map(order => 
            order._id === selectedOrder._id ? { ...order, status: newStatus } : order
          ));
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
          setNotification(`Order status updated to "${newStatus}" successfully!`);
          setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds

          // Close the modal after updating the status
          handleCloseModal();
        } catch (error) {
          console.error('Error updating order status', error);
        }
      }
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (confirmed) {
      await handleUpdateStatus('Canceled');
    }
  };

  const groupItemsByProduct = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (!item || !item.product) return; // Safeguard
      const productName = item.product.name;
      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(`${item.variant} x${item.quantity} - ₱${item.price}`);
    });
    return grouped;
  };
  
  

  // Status priority
  const statusPriority = ['Order Received', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Canceled'];

  const ordersByStatus = statusPriority.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status);
    return acc;
  }, {});

  const paginateOrders = (orders, currentPage) => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return orders.slice(startIndex, endIndex);
  };

  const handleNextPage = (status) => {
    const currentPage = currentPageByStatus[status];
    if ((currentPage * ordersPerPage) < ordersByStatus[status].length) {
      setCurrentPageByStatus(prev => ({ ...prev, [status]: currentPage + 1 }));
    }
  };

  const handlePrevPage = (status) => {
    const currentPage = currentPageByStatus[status];
    if (currentPage > 1) {
      setCurrentPageByStatus(prev => ({ ...prev, [status]: currentPage - 1 }));
    }
  };

  return (
    <div>
      {notification && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded shadow-md z-50">
          {notification}
        </div>
      )}

      <h2 className="text-center text-lg font-bold mb-4">Orders for {branchAddresses[branch] || capitalizeFirstLetter(branch)} Branch</h2>

      {statusPriority.map(status => (
        <div key={status} className={`mb-8 border p-4 rounded ${status === 'Canceled' ? 'border-red-500' : status === 'Picked Up' ? 'border-green-500' : status === 'Ready for Pickup' ? 'border-yellow-500' : status === 'Preparing' ? 'border-blue-500' : 'border-gray-500'}`}>
          <h3 className={`text-xl font-bold mb-2 ${status === 'Canceled' ? 'text-red-500' : status === 'Picked Up' ? 'text-green-500' : status === 'Ready for Pickup' ? 'text-yellow-500' : status === 'Preparing' ? 'text-blue-500' : 'text-gray-500'}`}>
            {status}
          </h3>
          <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm mb-4">
            <thead>
              <tr className="w-full bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Order #</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Date & Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {paginateOrders(ordersByStatus[status], currentPageByStatus[status]).length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-3 px-6 text-center">No orders found for this status.</td>
                </tr>
              ) : (
                paginateOrders(ordersByStatus[status], currentPageByStatus[status]).map(order => (
                  <tr key={order._id} 
                      className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(order)}>
                    <td className="py-3 px-6">{order.orderNumber}</td>
                    <td className="py-3 px-6">{order.user.name}</td>
                    <td className="py-3 px-6">₱{order.total}</td>
                    <td className="py-3 px-6">{formatOrderDateTime(order.orderNumber)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <button 
              onClick={() => handlePrevPage(status)} 
              disabled={currentPageByStatus[status] === 1} 
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => handleNextPage(status)} 
              disabled={(currentPageByStatus[status] * ordersPerPage) >= ordersByStatus[status].length} 
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ))}

      {selectedOrder && (
        <Modal onClose={handleCloseModal}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            <table className="min-w-full mb-4">
              <tbody>
                <tr>
                  <td className="font-bold">Order #:</td>
                  <td className="text-right">{selectedOrder.orderNumber}</td>
                </tr>
                <tr>
                  <td className="font-bold">Customer:</td>
                  <td className="text-right">{selectedOrder.user.name}</td>
                </tr>
                <tr>
                  <td className="font-bold">Contact:</td>
                  <td className="text-right">{selectedOrder.user.contact}</td>
                </tr>
                <tr>
                  <td className="font-bold">Status:</td>
                  <td className="text-right">{selectedOrder.status}</td>
                </tr>
              </tbody>
            </table>
            
            <h3 className="mt-4 mb-2 font-bold">Items</h3>
            <div className="mb-2">
              <table className="min-w-full">
                <tbody>
                  {Object.entries(groupItemsByProduct(selectedOrder.items)).map(([productName, variants]) => (
                    <React.Fragment key={productName}>
                      <tr>
                        <td className="font-bold">{productName}</td>
                      </tr>
                      {variants.map((variant, index) => {
                        const [variantName, price] = variant.split(' - ₱');
                        return (
                          <tr key={index}>
                            <td className="text-left pl-4">
                              {variantName} - 
                              <span className="float-right">₱{price}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 font-bold text-right">Total: ₱{selectedOrder.total}</p>

            <div className="mt-4">
              <h3 className="font-bold">Change Order Status:</h3>
              <button className="mr-2 mt-2 px-4 py-2 bg-blue-500 text-white rounded" 
                      onClick={() => handleUpdateStatus('Preparing')}>Prepare</button>
              <button className="mr-2 mt-2 px-4 py-2 bg-yellow-500 text-white rounded" 
                      onClick={() => handleUpdateStatus('Ready for Pickup')}>Ready for Pickup</button>
              <button className="mr-2 mt-2 px-4 py-2 bg-green-500 text-white rounded" 
                      onClick={() => handleUpdateStatus('Picked Up')}>Complete Order</button>
              <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded" 
                      onClick={handleCancelOrder}>Cancel Order</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BranchOrders;
