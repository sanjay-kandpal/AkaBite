import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Please log in to view your cart.');
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token before cart request:', token); // Add this line
      const response = await api.get('/cart');
      console.log('Cart response:', response.data);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/remove/${itemId}`);
      fetchCart(); // Refresh cart after removing item
    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
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
      <h1 className="text-4xl font-bold mb-8 text-center">Your Cart</h1>
      {cart && cart.items.length > 0 ? (
        <>
          <div className="bg-white shadow-md rounded my-6">
            <table className="text-left w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Item</th>
                  <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Quantity</th>
                  <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Price</th>
                  <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map(item => (
                  <tr key={item._id} className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light">{item.item.name}</td>
                    <td className="py-4 px-6 border-b border-grey-light">{item.quantity}</td>
                    <td className="py-4 px-6 border-b border-grey-light">${(item.item.price * item.quantity).toFixed(2)}</td>
                    <td className="py-4 px-6 border-b border-grey-light">
                      <button
                        onClick={() => handleRemoveItem(item.item._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCheckout}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      )}
    </div>
  );
}

export default Cart;