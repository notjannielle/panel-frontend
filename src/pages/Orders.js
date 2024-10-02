import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from './Modal'; // Ensure the path is correct

const Orders = () => {
  const [orders, setOrders] = useState([]); // Initialize orders state
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get('token');
        console.log('Token:', token);

        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Orders response:', response.data); // Log the orders response

        // Process orders to extract date from orderNumber and sort
        const processedOrders = response.data.map(order => {
          const orderDate = formatOrderDateTime(order.orderNumber);
          return { ...order, orderDate };
        }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sort descending by orderDate

        setOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching orders', error);
      }
    };
    fetchOrders();
  }, []);

  // Function to format the order date and time
  const formatOrderDateTime = (orderNumber) => {
    const numberPart = orderNumber.replace('ORD-', '');

    const year = `20${numberPart.substring(0, 2)}`; // Extract year
    const month = numberPart.substring(2, 4); // Extract month
    const day = numberPart.substring(4, 6); // Extract day
    const hour = numberPart.substring(6, 8); // Extract hour
    const minute = numberPart.substring(8, 10); // Extract minute

    // Create a date object using a valid ISO 8601 format
    const dateString = `${year}-${month}-${day}T${hour}:${minute}:00`;
    const date = new Date(dateString);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format the date to a readable string
    return date.toLocaleString(); // Convert Date object to a readable string
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
        <thead>
          <tr className="w-full bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6">Order #</th>
            <th className="py-3 px-6">Customer</th>
            <th className="py-3 px-6">Status</th>
            <th className="py-3 px-6">Total</th>
            <th className="py-3 px-6">Date & Time</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {orders.map(order => (
            <tr key={order._id} 
                className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(order)}>
              <td className="py-3 px-6">{order.orderNumber}</td>
              <td className="py-3 px-6">{order.user.name}</td>
              <td className="py-3 px-6">{order.status}</td>
              <td className="py-3 px-6">₱{order.total}</td>
              <td className="py-3 px-6">{order.orderDate}</td> {/* Display formatted date */}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
  <Modal onClose={handleCloseModal}>
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Order Details</h2>
      <p><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
      <p><strong>Customer:</strong> {selectedOrder.user.name}</p>
      <p><strong>Contact:</strong> {selectedOrder.user.contact}</p>
      <p><strong>Status:</strong> {selectedOrder.status}</p>
      
      <h3 className="mt-4 mb-2 font-bold">Items</h3>

      {/* Group items by branch */}
      {['main', 'second', 'third'].map(branch => {
        const branchItems = selectedOrder.items.filter(item => item.branch === branch);

        if (branchItems.length === 0) return null; // Skip if no items in this branch

        return (
          <div key={branch} className="mt-4">
            <h4 className="font-bold">{branch.charAt(0).toUpperCase() + branch.slice(1)} Branch</h4>
            <ul className="list-disc ml-5">
              {branchItems.map(item => (
                <li key={item._id} className="mb-2">
                  <p><strong>Product Name:</strong> {item.product.name}</p>
                  <p>
                    <strong>Variant:</strong> {item.variant} x{item.quantity} - ₱{item.price}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Calculate total price */}
      <p className="mt-4 font-bold">
        Total: ₱{selectedOrder.total}
      </p>
    </div>
  </Modal>
)}

    </div>
  );
};

export default Orders;
