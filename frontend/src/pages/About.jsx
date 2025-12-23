import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/style.css";
import Footer from "../components/Footer/Footer";

export default function About() {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ----------------------------- body padding -----------------------------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = "body { padding-top: 80px; }";
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ----------------------------- fade-in effect -----------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("fade-in-visible")),
      { threshold: 0.2 }
    );
    document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ----------------------------- scroll logic -----------------------------
  const scrollToContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ----------------------------- team data -----------------------------
  const team = [
    { img: "/Images/chef1.jpg", name: "Chef Ali", role: "Head Chef" },
    { img: "/Images/chef2.jpg", name: "Chef Nour", role: "Pastry Specialist" },
    { img: "/Images/chef3.jpg", name: "Chef Karim", role: "Grill Expert" },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/home"><img src="Images/LOGO.jpg" className="ImageLogo" alt="LOGO" /></Link>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li>
            {location.pathname === "/home" ? (
              <button onClick={scrollToContact} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", font: "inherit", fontSize: "1em" }}>Contact</button>
            ) : (
              <Link to="/home" onClick={() => setTimeout(scrollToContact, 100)}>Contact</Link>
            )}
          </li>
          <li><Link to="/order" className="order-button">Order Now</Link></li>
        </ul>
        <div className="burger"><div></div><div></div><div></div></div>
      </nav>

      {/* About Section */}
      <section id="about" className="about-section fade-in">
        <h2>Our Story</h2>
        <p>Welcome to <strong>Mostafa Restaurant</strong> – where luxury meets taste. Founded with passion by our skilled chefs and staff, we deliver a fine dining experience blending elegance, flavor, and warmth.</p>
        <p>Every dish is crafted with precision using only the finest ingredients, ensuring each bite tells a story of tradition, quality, and excellence.</p>
        <p>We don’t just serve food — we serve an experience. Join us and indulge in the art of fine dining.</p>
      </section>

      {/* Statistics Section */}
      <section className="about-stats fade-in">
        <h2>Our Achievements</h2>
        <div className="stats-grid">
          <div className="stat-card"><h3>5000+</h3><p>Dishes Served</p></div>
          <div className="stat-card"><h3>1000+</h3><p>Happy Customers</p></div>
          <div className="stat-card"><h3>15+</h3><p>Years of Experience</p></div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section fade-in">
        <h2>Meet Our Chefs</h2>
        <div className="team-grid">
          {team.map((chef, idx) => (
            <div key={idx} className="team-card">
              <img src={chef.img} alt={chef.name} />
              <h3>{chef.name}</h3>
              <p>{chef.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div id="contact"><Footer /></div>

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button onClick={scrollToTop} style={{ position: "fixed", right: 25, bottom: 25, width: 50, height: 50, borderRadius: "50%", background: "#d35400", color: "#fff", fontSize: 24, border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>↑</button>
      )}
    </div>
  );
}
