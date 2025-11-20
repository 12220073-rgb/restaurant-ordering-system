// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();

    const adminEmail = 'admin@mostafa.com';
    const adminPassword = 'Admin123!';

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      navigate('/home');
    } else if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'customer');

      const customers = JSON.parse(localStorage.getItem('users')) || [];
      if (!customers.find(c => c.email === email)) {
        customers.push({ name: name || email.split('@')[0], email });
        localStorage.setItem('users', JSON.stringify(customers));
      }

      navigate('/home');
    } else {
      setError('Please enter your email and password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to Mostafa Restaurant</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-info">
          <p>
            Admin credentials: <strong>admin@mostafa.com / Admin123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
