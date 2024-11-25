import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from './Modal'; // Ensure the path is correct

const BranchOrdersV2 = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notification, setNotification] = useState('');
  const [currentPagePickedUp, setCurrentPagePickedUp] = useState(1);
  const [currentPageCanceled, setCurrentPageCanceled] = useState(1);
  const ITEMS_PER_PAGE = 10; // Define the number of items per page

  const branch = JSON.parse(Cookies.get('userData') || '{}').branch;


  const parseOrderDate = (orderNumber) => {
    const numberPart = orderNumber.replace('ORD-', '');
    const year = `20${numberPart.substring(0, 2)}`; // Assuming years are from 2000
    const month = numberPart.substring(2, 4);
    const day = numberPart.substring(4, 6);
    const hour = numberPart.substring(6, 8);
    const minutes = numberPart.substring(8, 10);
    const seconds = numberPart.substring(10, 12);
    
    // Create a date string in ISO format
    const dateString = `${year}-${month}-${day}T${hour}:${minutes}:${seconds}`;
    return new Date(dateString);
  };

  useEffect(() => {
    const fetchBranchOrders = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const filteredOrders = response.data.filter(order => order.branch === branch);
        const sortedOrders = filteredOrders.sort((a, b) => {
          return parseOrderDate(b.orderNumber) - parseOrderDate(a.orderNumber); // Sort in descending order
        });
    
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching branch orders', error);
      }
    };

    fetchBranchOrders();
  }, [branch]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Only update the order if it's being moved to a new status
    if (source.droppableId !== destination.droppableId) {
      const movedOrder = orders.find(order => order._id === result.draggableId);
      let newStatus = destination.droppableId;

      // Map Completed to Picked Up
      if (newStatus === 'Completed') {
        newStatus = 'Picked Up';
      }

      try {
        const token = Cookies.get('token');
        await axios.put(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders/${movedOrder._id}/status`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(prevOrders => prevOrders.map(order =>
          order._id === movedOrder._id ? { ...order, status: newStatus } : order
        ));
      } catch (error) {
        console.error('Error updating order status', error);
      }
    }
  };

  const branchAddresses = {
    main: 'Main Branch - Piy Margal',
    second: 'Second Branch - Honradez',
    third: 'Third Branch - G. Tuazon',
    fourth: 'Fourth Branch',
  };


  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatOrderDateTime = (orderNumber) => {
    const numberPart = orderNumber.replace('ORD-', '');
    const dateString = `20${numberPart.substring(0, 2)}-${numberPart.substring(2, 4)}-${numberPart.substring(4, 6)}T${numberPart.substring(6, 8)}:${numberPart.substring(8, 10)}:${numberPart.substring(10, 12)}`;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };
  
  const handleCloseModal = () => setSelectedOrder(null);

  const groupItemsByProduct = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (!item || !item.product) return; // Safeguard
      const productName = item.product.name;
      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(`${item.variant} (${item.quantity} pcs) - ₱${item.price}`);
    });
    return grouped;
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      const token = Cookies.get('token');
      await axios.put(`${process.env.REACT_APP_ADMIN_SERVER}/api/orders/${selectedOrder._id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(prevOrders => prevOrders.map(order =>
        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
      ));

      setNotification(`Order #${selectedOrder.orderNumber} status updated to ${newStatus}`);
      setTimeout(() => setNotification(''), 3000);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status', error);
    }
  };
  const ordersByStatus = {
    'Order Received': orders.filter(order => order.status === 'Order Received'),
    'Preparing': orders.filter(order => order.status === 'Preparing'),
    'Ready for Pickup': orders.filter(order => order.status === 'Ready for Pickup'),
    'Picked Up': orders.filter(order => order.status === 'Picked Up'),
    'Canceled': orders.filter(order => order.status === 'Canceled'),
  };
  
  
  const getCurrentPageOrders = (status, currentPage) => {
    const sortedOrders = ordersByStatus[status];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  
  
  
  const maxPagePickedUp = Math.ceil(ordersByStatus['Picked Up'].length / ITEMS_PER_PAGE);
  const maxPageCanceled = Math.ceil(ordersByStatus['Canceled'].length / ITEMS_PER_PAGE);
  
  const handlePageChange = (status, direction) => {
    if (status === 'Picked Up') {
      setCurrentPagePickedUp(prev => Math.max(1, Math.min(prev + direction, maxPagePickedUp)));
    } else {
      setCurrentPageCanceled(prev => Math.max(1, Math.min(prev + direction, maxPageCanceled)));
    }
  };

  return (
    <div className="container mx-auto p-6">
      {notification && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded shadow-lg z-50">
          {notification}
        </div>
      )}
   <h2 className="text-center text-2xl text-blue-500 font-bold mb-4">Orders for {branchAddresses[branch] || capitalizeFirstLetter(branch)} Branch</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
  <div className="flex space-x-6 overflow-x-auto">
    {['Order Received', 'Preparing', 'Ready for Pickup'].map(status => (
      <Droppable key={status} droppableId={status}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-lg w-72 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className={`h-3 w-3 rounded-full ${status === 'Order Received' ? 'bg-gray-500' : status === 'Preparing' ? 'bg-yellow-500' : 'bg-green-500'} mr-2`} />
              <h3 className="text-xl font-bold text-center">{status}</h3>
            </div>
            {ordersByStatus[status].map((order, index) => (
              <Draggable key={order._id} draggableId={order._id} index={index}>
                {(provided) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={`bg-white p-4 mb-2 rounded-md shadow-md hover:shadow-lg transition cursor-pointer border-l-4 
                      ${order.status === 'Order Received' ? 'border-gray-500' : 
                       order.status === 'Preparing' ? 'border-yellow-500' : 
                       order.status === 'Ready for Pickup' ? 'border-green-500' : 
                       order.status === 'Picked Up' ? 'border-green-700' : 
                       order.status === 'Canceled' ? 'border-red-500' : 'border-blue-500'}`}
                    onClick={() => handleRowClick(order)}
                  >
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-gray-600">{order.user.name}</p>
                    <p className="font-bold text-green-600">₱{order.total}</p>
                    <p className={`text-xs ${order.paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'}`}>
  {(order.paymentMethod || '').toUpperCase()}
</p>



                    <p className="text-gray-500 text-xs">{formatOrderDateTime(order.orderNumber)}</p>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ))}

    <Droppable droppableId="Picked Up">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-lg w-72 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
            <h3 className="text-xl font-bold text-center">Picked Up</h3>
          </div>
          <div className="h-32 w-full border-dashed border-2 border-gray-400 flex items-center justify-center text-gray-500">
            Drop orders here
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>

    <Droppable droppableId="Canceled">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-lg w-72 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
            <h3 className="text-xl font-bold text-center">Canceled</h3>
          </div>
          <div className="h-32 w-full border-dashed border-2 border-gray-400 flex items-center justify-center text-gray-500">
            Drop orders here
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
</DragDropContext>


      {/* Tables for Picked Up and Canceled orders */}
      <div className="mt-10">
      <h3 className="text-2xl font-bold mb-4 text-center">Picked Up Orders</h3>
<table className="min-w-full border-collapse border border-gray-300">
  <thead>
    <tr>
      <th className="border border-gray-300 p-2">Order Number</th>
      <th className="border border-gray-300 p-2">Customer Name</th>
      <th className="border border-gray-300 p-2">Total</th>
      <th className="border border-gray-300 p-2">Date</th>
    </tr>
  </thead>
  <tbody>
    {getCurrentPageOrders('Picked Up', currentPagePickedUp).map(order => (
      <tr key={order._id} onClick={() => handleRowClick(order)} className="cursor-pointer hover:bg-gray-100">
        <td className="border border-gray-300 p-2">{order.orderNumber}</td>
        <td className="border border-gray-300 p-2">{order.user.name}</td>
        <td className="border border-gray-300 p-2">₱{order.total}</td>
        <td className="border border-gray-300 p-2">{formatOrderDateTime(order.orderNumber)}</td>
      </tr>
    ))}
  </tbody>
</table>
<div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          onClick={() => handlePageChange('Picked Up', -1)}
          disabled={currentPagePickedUp === 1}
        >
          Previous
        </button>
        <span>Page {currentPagePickedUp} of {maxPagePickedUp}</span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
          onClick={() => handlePageChange('Picked Up', 1)}
          disabled={currentPagePickedUp === maxPagePickedUp}
        >
          Next
        </button>
      </div>



<h3 className="text-2xl font-bold mb-4 text-center">Canceled Orders</h3>
<table className="min-w-full border-collapse border border-gray-300">
  <thead>
    <tr>
      <th className="border border-gray-300 p-2">Order Number</th>
      <th className="border border-gray-300 p-2">Customer Name</th>
      <th className="border border-gray-300 p-2">Total</th>
      <th className="border border-gray-300 p-2">Date</th>
    </tr>
  </thead>
  <tbody>
    {getCurrentPageOrders('Canceled', currentPageCanceled).map(order => (
      <tr key={order._id} onClick={() => handleRowClick(order)} className="cursor-pointer hover:bg-gray-100">
        <td className="border border-gray-300 p-2">{order.orderNumber}</td>
        <td className="border border-gray-300 p-2">{order.user.name}</td>
        <td className="border border-gray-300 p-2">₱{order.total}</td>
        <td className="border border-gray-300 p-2">{formatOrderDateTime(order.orderNumber)}</td>
      </tr>
    ))}
  </tbody>
</table>
    
 
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          onClick={() => handlePageChange('Canceled', -1)}
          disabled={currentPageCanceled === 1}
        >
          Previous
        </button>
        <span>Page {currentPageCanceled} of {maxPageCanceled}</span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
          onClick={() => handlePageChange('Canceled', 1)}
          disabled={currentPageCanceled === maxPageCanceled}
        >
          Next
        </button>
      </div>
    </div>
    {selectedOrder && (
  <Modal onClose={handleCloseModal} style={{ width: '100%', maxWidth: '800px' }}>
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
            <td className="font-bold">Payment Method:</td>
            <td className="text-right">{capitalizeFirstLetter(selectedOrder.paymentMethod)}</td>
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
                        - {variantName}  
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

      {/* Status Change Buttons */}
      <div className="mt-4 flex justify-end space-x-2">
  {selectedOrder.status !== 'Canceled' && (
    <button
      className="px-4 py-2 bg-red-500 text-white rounded"
      onClick={() => handleUpdateStatus('Canceled')}
    >
      Mark as Canceled
    </button>
  )}
  {selectedOrder.status !== 'Order Received' && selectedOrder.status !== 'Canceled' && (
    <button
      className="px-4 py-2 bg-yellow-500 text-white rounded"
      onClick={() => handleUpdateStatus('Preparing')}
    >
      Mark as Preparing
    </button>
  )}
  {selectedOrder.status !== 'Preparing' && selectedOrder.status !== 'Canceled' && (
    <button
      className="px-4 py-2 bg-green-500 text-white rounded"
      onClick={() => handleUpdateStatus('Ready for Pickup')}
    >
      Mark as Ready for Pickup
    </button>
  )}
  {selectedOrder.status !== 'Picked Up' && selectedOrder.status !== 'Canceled' && (
    <button
      className="px-4 py-2 bg-green-700 text-white rounded"
      onClick={() => handleUpdateStatus('Picked Up')}
    >
      Mark as Picked Up
    </button>
  )}
  {selectedOrder.status === 'Canceled' && (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => handleUpdateStatus('Order Received')}
    >
      Reopen Order
    </button>
  )}
</div>

    </div>
  </Modal>
)}


    </div>
  );
};

export default BranchOrdersV2;
