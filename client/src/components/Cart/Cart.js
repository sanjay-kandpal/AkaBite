import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      console.log(response.data.items);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items. Please try again later.');
      setCartItems(false)
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await handleRemoveItem(itemId);
        return;
      }
      
      await api.put(`/cart/update/${itemId}`, { quantity: newQuantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating item quantity:', error);
      alert('Failed to update item quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1} price:`, item.item.price);
      console.log(`Item ${index + 1} quantity:`, item.quantity);
      console.log(`Type of price:`, typeof item.price);
      console.log(`Type of quantity:`, typeof item.quantity);
  
      total += item.item.price * item.quantity;
    });
  
    return total.toFixed(2);
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
  
  console.log(cartItems[0].item.price.toFixed(2));
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/" className="text-blue-500 hover:underline">Continue shopping</Link></p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((cartItem,index) => (
              <li key={cartItem._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img src={cartItem.item.imageUrl} alt={cartItem.item.name} className="w-16 h-16 object-cover rounded mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold">{cartItem.item.name}</h2>
                    <p className="text-gray-600">${cartItem.item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity - 1)}
                    className="bg-gray-200 px-2 py-1 rounded-l"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={cartItem.quantity}
                    onChange={(e) => handleQuantityChange(cartItem._id, parseInt(e.target.value) || 0)}
                    className="w-16 text-center border-t border-b border-gray-200"
                  />
                  <button 
                    onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity + 1)}
                    className="bg-gray-200 px-2 py-1 rounded-r"
                  >
                    +
                  </button>
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
          <div className="mt-8">
            <p className="text-xl font-semibold">Total: ${calculateTotal()}</p>
            <button 
              onClick={() => navigate('/checkout')}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;