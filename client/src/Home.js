import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchItemsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(`/api/items?category=${categoryId}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">Welcome to Our Store</h1>
      
      {/* Category Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                selectedCategory?._id === category._id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Item Grid */}
      {!selectedItem && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{selectedCategory?.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-indigo-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Details */}
      {selectedItem && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <button 
            onClick={() => setSelectedItem(null)}
            className="mb-4 text-indigo-600 hover:text-indigo-800"
          >
            &larr; Back to items
          </button>
          <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
          <p className="text-gray-600 mb-4">{selectedItem.description}</p>
          <p className="text-xl font-bold text-indigo-600 mb-4">${selectedItem.price.toFixed(2)}</p>
          <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors duration-150">
            Add to Basket
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;