import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please log in to view your order history.');
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token before order history request:', token); // Add this line for debugging
      const response = await api.get('/orders/history');
      console.log('Order history response:', response.data); // Add this line for debugging
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history. Please try again later.');
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Order History</h1>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order #{order._id}</h2>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-200 text-green-800' :
                  order.status === 'processing' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-4">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span>{item.item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total Amount:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">You haven't placed any orders yet.</p>
      )}
    </div>
  );
}

export default OrderHistory;