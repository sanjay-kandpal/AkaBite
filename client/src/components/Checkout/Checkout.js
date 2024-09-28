import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockError, setStockError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Please log in to proceed to checkout.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token before cart request in Checkout:', token); // Add this line for debugging
      const response = await api.get('/cart');
      console.log('Cart response in Checkout:', response.data); // Add this line for debugging
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again later.');
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await api.post('/orders/create');
      if(response.data.stockError){
        setStockError(response.data.stockError);
      }else{
        alert('Order placed successfully! Your order is: ' + response.data._id);
        navigate('/order-history')
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response && error.response.data.stockError) {
        setStockError(error.response.data.stockError);
      } else {
        alert('Failed to place order. Please try again.');
      }
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
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

  const totalAmount = cart ? cart.items.reduce((total, item) => total + (item.item.price * item.quantity), 0) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
      {cart && cart.items.length > 0 ? (
        <>
          <div className="bg-white shadow-md rounded my-6 p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            {cart.items.map(item => (
              <div key={item._id} className="flex justify-between items-center mb-2">
                <span>{item.item.name} x {item.quantity}</span>
                <span>${(item.item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePlaceOrder}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Place Order
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty. Cannot proceed to checkout.</p>
      )}
    </div>
  );
}

export default Checkout;