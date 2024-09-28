import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';

function ItemDetail() {
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('Failed to load item details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleAddToCart = async () => {
    try {
      const response = await api.post('/cart/add', { itemId: item._id, quantity });
      console.log('Add to cart response:', response.data);
      alert(`${quantity} ${item.name}(s) added to cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding item to cart:', error.response?.data || error.message);
      alert('Failed to add item to cart. Please try again.');
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

  if (!item) {
    return <div className="text-center">Item not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Back
      </button>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover" />
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <p className="text-green-600 font-bold text-xl mb-4">${item.price.toFixed(2)}</p>
          <div className="flex items-center mb-4">
            <label htmlFor="quantity" className="mr-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={item.stockQuantity}
              className="border rounded px-2 py-1 w-20"
            />
          </div>
          <button 
            onClick={handleAddToCart}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            disabled={item.stockQuantity === 0}
          >
            {item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {item.stockQuantity > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {item.stockQuantity} left in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;