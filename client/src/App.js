import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider,useAuth  } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';

function AppContent() {
  const { isAuthenticated, isLoading,logout } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div>
        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-white hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link to="/cart" className="text-white hover:text-gray-300">Cart</Link>
            </li>
            <li>
              <Link to="/order-history" className="text-white hover:text-gray-300">Order History</Link>
            </li>
            {!isAuthenticated && (
              <>
                <li>
                  <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="text-white hover:text-gray-300">Register</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="text-white hover:text-gray-300"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <PrivateRoute>
                <OrderHistory />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export default App;