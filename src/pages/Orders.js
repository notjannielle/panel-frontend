import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from './Modal'; // Ensure the path is correct

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchPages, setBranchPages] = useState({});
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const processedOrders = response.data.map(order => {
          const orderDate = formatOrderDateTime(order.orderNumber);
          return { ...order, orderDate };
        }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        setOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching orders', error);
      }
    };
    fetchOrders();
  }, []);

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

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString();
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBranchPageChange = (branch, newPage) => {
    setBranchPages(prevState => ({
      ...prevState,
      [branch]: newPage
    }));
  };

  const statusColors = {
    'Canceled': 'border-red-500 text-red-500',
    'Picked Up': 'border-green-500 text-green-500',
    'Ready for Pickup': 'border-yellow-500 text-yellow-500',
    'Preparing': 'border-blue-500 text-blue-500',
  };

  const ordersByBranch = orders.reduce((acc, order) => {
    if (!acc[order.branch]) {
      acc[order.branch] = [];
    }
    acc[order.branch].push(order);
    return acc;
  }, {});

  const branchOrder = ['main', 'second', 'third']; // Define your desired order
  const sortedBranches = branchOrder.filter(branch => ordersByBranch[branch])
    .concat(Object.keys(ordersByBranch).filter(branch => !branchOrder.includes(branch)));

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700">Orders Summary (All Branch)</h3>

      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
        <thead>
          <tr className="w-full bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6">Order #</th>
            <th className="py-3 px-6">Customer</th>
            <th className="py-3 px-6">Status</th>
            <th className="py-3 px-6">Total</th>
            <th className="py-3 px-6">Date & Time</th>
            <th className="py-3 px-6">Branch</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {currentOrders.map(order => (
            <tr key={order._id}
                className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(order)}>
              <td className="py-3 px-6">{order.orderNumber}</td>
              <td className="py-3 px-6">{order.user.name}</td>
              <td className="py-3 px-6">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'border-gray-500 text-gray-500'}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-3 px-6">₱{order.total}</td>
              <td className="py-3 px-6">{order.orderDate}</td>
              <td className="py-3 px-6">{order.branch}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <div className="mt-6">
        <hr className="border-t-2 border-gray-300 my-4" />

        <h3 className="text-xl font-semibold text-gray-700">Orders Summary by Branch</h3>
        {sortedBranches.map(branch => {
          const branchOrders = ordersByBranch[branch];
          const currentBranchPage = branchPages[branch] || 1;
          const branchIndexOfLastOrder = currentBranchPage * ordersPerPage;
          const branchIndexOfFirstOrder = branchIndexOfLastOrder - ordersPerPage;
          const currentBranchOrders = branchOrders.slice(branchIndexOfFirstOrder, branchIndexOfLastOrder);
          const branchTotalPages = Math.ceil(branchOrders.length / ordersPerPage);

          return (
            <div key={branch} className="mt-4">
              <h4 className="text-lg font-semibold text-indigo-500">{branch.charAt(0).toUpperCase() + branch.slice(1)} Branch</h4>
              <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm mt-2">
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
                  {currentBranchOrders.map(order => (
                    <tr key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleRowClick(order)}>
                      <td className="py-3 px-6">{order.orderNumber}</td>
                      <td className="py-3 px-6">{order.user.name}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'border-gray-500 text-gray-500'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-6">₱{order.total}</td>
                      <td className="py-3 px-6">{order.orderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleBranchPageChange(branch, currentBranchPage - 1)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                  disabled={currentBranchPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentBranchPage} of {branchTotalPages}
                </span>
                <button
                  onClick={() => handleBranchPageChange(branch, currentBranchPage + 1)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                  disabled={currentBranchPage === branchTotalPages}
                >
                  Next
                </button>
              </div>
              <hr className="border-t-2 border-gray-300 my-4" />
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <Modal onClose={handleCloseModal}>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Order Details</h2>
            <p className="text-lg"><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
            <p className="text-lg"><strong>Customer:</strong> {selectedOrder.user.name}</p>
            <p className="text-lg"><strong>Contact:</strong> {selectedOrder.user.contact || 'N/A'}</p>
            <p className="text-lg"><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status] || 'border-gray-500 text-gray-500'}`}>{selectedOrder.status}</span></p>

            <h3 className="mt-6 mb-2 text-xl font-bold text-indigo-600">Items</h3>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              selectedOrder.items.map((item, index) => (
                <div key={index} className="mb-2">
                  <p><strong>Product Name:</strong> {item.product.name}</p>
                  <p>
                    <strong>Variant:</strong> {item.variant} x{item.quantity} - ₱{item.price}
                  </p>
                </div>
              ))
            ) : (
              <p>No items found for this order.</p>
            )}

            <p className="mt-6 text-xl font-bold text-gray-800">
              Total: ₱{selectedOrder.total}
            </p>

            <button
              onClick={handleCloseModal}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
