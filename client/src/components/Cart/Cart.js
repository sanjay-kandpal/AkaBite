import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCartItems(response.data.cart.items || []);
      
      // Check for missing or unavailable items
      const missing = response.data.cart.items.filter(item => item.quantity <= 0 || item.unavailable);
      setMissingItems(missing);

    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 0) {
        newQuantity = 0;
      }
      
      const response = await api.put(`/cart/update/${itemId}`, { quantity: newQuantity });
      setCartItems(response.data.items || []);
      
      // Check for newly unavailable items after update
      const updatedMissing = response.data.items.filter(item => item.quantity <= 0 || item.unavailable);
      setMissingItems(updatedMissing);

    } catch (error) {
      console.error('Error updating item quantity:', error);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to update item quantity. Please try again.');
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      setCartItems(response.data.items || []);
      
      // Update missing items list after removal
      setMissingItems(prev => prev.filter(item => item._id !== itemId));

    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const calculateTotal = useCallback(() => {
    return cartItems
      .filter(item => item.quantity > 0 && !item.unavailable)
      .reduce((total, item) => total + item.item.price * item.quantity, 0)
      .toFixed(2);
  }, [cartItems]);

  const hasAvailableItems = cartItems.some(item => item.quantity > 0 && !item.unavailable);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {missingItems.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Important Notice: </strong>
          <span className="block sm:inline">
            The following items in your cart are currently unavailable or out of stock:
            <ul className="list-disc list-inside mt-2">
              {missingItems.map(item => (
                <li key={item._id}>{item.item.name}</li>
              ))}
            </ul>
            These items will not be included in your order. You may choose to remove them or keep them in your cart for future purchase.
          </span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/" className="text-blue-500 hover:underline">Continue shopping</Link></p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((cartItem) => (
              <li key={cartItem._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img src={cartItem.item.imageUrl} alt={cartItem.item.name} className="w-16 h-16 object-cover rounded mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold">{cartItem.item.name}</h2>
                    <p className="text-gray-600">${cartItem.item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {cartItem.quantity <= 0 || cartItem.unavailable ? (
                    <span className="text-red-500 mr-4">Item Not Available</span>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity - 1)}
                        className="bg-gray-200 px-2 py-1 rounded-l"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={cartItem.quantity}
                        onChange={(e) => handleQuantityChange(cartItem._id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center border-t border-b border-gray-200"
                      />
                      <button 
                        onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity + 1)}
                        className="bg-gray-200 px-2 py-1 rounded-r"
                      >
                        +
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleRemoveItem(cartItem._id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {hasAvailableItems && (
            <div className="mt-8">
              <p className="text-xl font-semibold">Total: ${calculateTotal()}</p>
              <button 
                onClick={() => navigate('/checkout')}
                className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart;