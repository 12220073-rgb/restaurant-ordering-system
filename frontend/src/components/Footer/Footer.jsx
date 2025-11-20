import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

export default function Footer() {
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
            <li><a href="#about">About Us</a></li>
            <li><a href="#menu">Promotions</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#partners">Our Partners</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#faq">FAQs</a></li>
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
            <a
              href="https://www.instagram.com/mostafa_rest"
              target="_blank"
              rel="noreferrer"
              className="insta"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>

            <a
              href="https://www.facebook.com/youraccount"
              target="_blank"
              rel="noreferrer"
              className="fb"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>

            <a
              href="https://twitter.com/youraccount"
              target="_blank"
              rel="noreferrer"
              className="x"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          </div>

          <p>Subscribe to our newsletter for the latest offers and updates.</p>

          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mostafa Restaurant. All Rights Reserved.</p>
        <p>Designed with ❤️ by Mostafa Diab</p>
      </div>
    </footer>
  );
}