// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const QUICK_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/promotions', label: 'Promotions' },
  { to: '/blog', label: 'Blog' },
  { to: '/partners', label: 'Our Partners' },
  { to: '/careers', label: 'Careers' },
  { to: '/faqs', label: 'FAQs' },
];

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/mostafa_rest', icon: faInstagram, className: 'insta', label: 'Instagram' },
  { href: 'https://www.facebook.com/youraccount', icon: faFacebook, className: 'fb', label: 'Facebook' },
  { href: 'https://twitter.com/youraccount', icon: faXTwitter, className: 'x', label: 'X (Twitter)' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="footer-grid">
        {/* About */}
        <div className="footer-about">
          <h3>About Us</h3>
          <p>
            Mostafa Restaurant is where flavor meets passion. Fresh ingredients, warm hospitality,
            unforgettable dishes.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>📞 +961 03 123 456</p>
          <p>📧 info@mostafarestaurant.com</p>
          <p>📍 Main Street, Beirut, Lebanon</p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer">
            Get Directions →
          </a>
        </div>

        {/* Social & Newsletter */}
        <div className="footer-social">
          <h3>Stay Connected</h3>

          <div className="social-icons">
            {SOCIAL_LINKS.map(({ href, icon, className, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={className}
                aria-label={label}
                title={label}
              >
                <FontAwesomeIcon icon={icon} />
              </a>
            ))}
          </div>

          <p>Subscribe to our newsletter for the latest offers and updates.</p>

          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>&copy; {year} Mostafa Restaurant. All Rights Reserved.</p>
        <p>Designed with ❤️ by Mostafa Diab</p>
      </div>
    </footer>
  );
}
