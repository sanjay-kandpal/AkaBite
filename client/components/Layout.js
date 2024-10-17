import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

function NavLink({ href, children, onClick }) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <li>
      <Link href={href} 
        
          onClick={onClick}
          className={`px-3 py-2 rounded-full text-white font-medium ${
            isActive ? 'bg-orange-600' : 'hover:bg-orange-600'
          }`}
        
      >
        {children}
      </Link>
    </li>
  );
}

function Layout({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Navigation bar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full shadow-lg z-50">
        <div className="px-4 py-2">
          <ul className="flex items-center space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/cart">Basket</NavLink>
            <NavLink href="/order-history">History</NavLink>
            {!isAuthenticated ? (
              <>
                <NavLink href="/login">Login</NavLink>
                <NavLink href="/register">Register</NavLink>
              </>
            ) : (
              <NavLink href="/login" onClick={handleLogout}>
                Logout
              </NavLink>
            )}
          </ul>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;