import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ImageWithFallback({ src, alt, className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  const categories = ['All', 'Fruit', 'Vegetable', 'Non-veg', 'Breads', 'Other'];

  const banners = [
    { title: "Welcome to Akabite!", content: "Get 50% OFF on Your First Order" },
    { title: "New Items Added!", content: "Check out our latest collection" },
    { title: "Free Delivery", content: "On orders over $50" },
  ];

  useEffect(() => {
    fetchItems();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchTerm, items]);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items');
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let result = items;
    
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowercasedSearch) ||
        item.description.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    setFilteredItems(result);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setSearchTerm('');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
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
    <div className="bg-white min-h-screen relative">
      <div className="bg-orange-600 text-white py-8 px-6 relative">
        <div className="container mx-auto max-w-6xl flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <button 
              onClick={prevSlide} 
              className="text-white hover:text-orange-200 transition duration-300 text-3xl font-bold"
              aria-label="Previous slide"
            >
              &#8249;
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-bold">{banners[currentSlide].title}</h2>
              <p className="text-xl mt-2">{banners[currentSlide].content}</p>
            </div>
            <button 
              onClick={nextSlide} 
              className="text-white hover:text-orange-200 transition duration-300 text-3xl font-bold"
              aria-label="Next slide"
            >
              &#8250;
            </button>
          </div>
          <div className="flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? 'bg-white' : 'bg-orange-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center mb-8 relative">
          {isSearchActive ? (
            <div className="flex items-center bg-white rounded-full shadow-lg w-full max-w-3xl">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-6 py-3 w-full rounded-l-full focus:outline-none"
              />
              <button
                onClick={toggleSearch}
                className="bg-orange-500 text-white p-3 rounded-r-full hover:bg-orange-600 transition duration-300"
                aria-label="Close search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-orange-600 mr-4">Akabite</h1>
              <button
                onClick={toggleSearch}
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition duration-300"
                aria-label="Open search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
              } transition duration-300`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <Link 
                  to={`/item/${item._id}`}
                  className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                <p className="text-gray-600 mt-2">{item.description}</p>
                <p className="text-lg font-bold text-orange-600 mt-2">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No items found. Try adjusting your search or category selection.</p>
        )}
      </div>
    </div>
  );
}

export default Home;