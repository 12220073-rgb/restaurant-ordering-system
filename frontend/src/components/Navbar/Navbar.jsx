// src/components/Navbar/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollContact, setScrollContact] = useState(false);

  const go = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    go('/login');
  };

  const handleOrderClick = () => go(localStorage.getItem('isLoggedIn') === 'true' ? '/order' : '/login');

  const handleContactClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname === '/home') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setScrollContact(true);
      navigate('/home');
    }
  };

  useEffect(() => {
    if (scrollContact && location.pathname === '/home') {
      setScrollContact(false);
      setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [scrollContact, location.pathname]);

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
        {navLinks.map(({ name, path }) => (
          <li key={path}>
            <Link to={path} onClick={() => setIsMenuOpen(false)}>{name}</Link>
          </li>
        ))}

        <li>
          <a href="/home#contact" className={location.pathname === '/home' ? 'menu-button' : undefined} onClick={handleContactClick}>
            Contact
          </a>
        </li>

        <li>
          <button className="order-button" onClick={handleOrderClick}>Order Now</button>
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
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </li>
      </ul>

      <div className={`burger ${isMenuOpen ? 'toggle' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div></div><div></div><div></div>
      </div>
    </nav>
  );
}
