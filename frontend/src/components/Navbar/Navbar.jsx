// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleOrderClick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    navigate(isLoggedIn ? '/order' : '/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="navbar">
      <Link to="/home" onClick={() => setIsMenuOpen(false)}>
        <img src="Images/LOGO.jpg" alt="Restaurant Logo" className="logo" />
      </Link>

      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        {navLinks.map(link => (
          <li key={link.path}>
            <Link to={link.path} onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          </li>
        ))}

        <li>
          {location.pathname === '/home' ? (
            <Link to="/home" className="menu-button" onClick={scrollToContact}>
              Contact
            </Link>
          ) : (
            <Link to="/home" onClick={() => setTimeout(scrollToContact, 100)}>
              Contact
            </Link>
          )}
        </li>

        <li>
          <button className="order-button" onClick={handleOrderClick}>
            Order Now
          </button>
        </li>

        {userRole === 'admin' && (
          <li>
            <Link to="/admin" className="admin-button" onClick={() => setIsMenuOpen(false)}>
              Admin Dashboard
            </Link>
          </li>
        )}

        {userRole && (
          <li className={`welcome-message ${userRole}`}>
            Welcome {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </li>
        )}

        <li>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>

      <div
        className={`burger ${isMenuOpen ? 'toggle' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>
  );
}
