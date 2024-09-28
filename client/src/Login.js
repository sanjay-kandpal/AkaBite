import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data); // Add this line for debugging
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        setMessage('Logged in successfully');
        navigate('/'); // Redirect to home page or dashboard
      } else {
        setMessage('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px' }}>
      <h1>Login</h1>
      {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '5px' }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;