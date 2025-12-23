import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import "../styles/style.css";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";

export default function Home() {
  const [showScroll, setShowScroll] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const carouselRef = useRef(null);

  // ---------- Body padding ----------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = "body { padding-top: 80px; }";
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ---------- Cookies ----------
  useEffect(() => {
    if (!Cookies.get("isLoggedIn")) Cookies.set("isLoggedIn", "true", { expires: 7 });
    if (!Cookies.get("userRole")) Cookies.set("userRole", "customer", { expires: 7 });
    if (!Cookies.get("cookieConsent")) setTimeout(() => setShowCookie(true), 1500);
  }, []);

  // ---------- Scroll-to-top ----------
  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const acceptCookies = () => { Cookies.set("cookieConsent", "accepted", { expires: 365 }); setShowCookie(false); };
  const declineCookies = () => { Cookies.set("cookieConsent", "declined", { expires: 365 }); setShowCookie(false); };

  // ---------- Carousel ----------
  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const popularDishes = [
    "Images/appetizers.jpeg","Images/BeefBurger.jpeg","Images/Pizza.jpeg",
    "Images/MixedPlatter.jpeg","Images/EscalopePlatter.jpeg","Images/ShrimpsPlatter.jpeg",
    "Images/Desserts1.jpeg","Images/I1.jpeg","Images/I2.jpeg","Images/I3.jpeg"
  ];

  const specialOffers = [
    { title: "Beef Burger", description: "Juicy and delicious beef burger", image: "/Images/BeefBurger.jpeg" },
    { title: "Offer Meal", description: "Special combo for you", image: "/Images/OfferMeal1.jpeg" }
  ];

  const testimonials = [
    { name: "Ali H.", review: "Amazing food! Highly recommended.", rating: 5 },
    { name: "Sara K.", review: "Best restaurant in town. Friendly staff!", rating: 4.5 },
    { name: "Joseph M.", review: "Delicious dishes and fast service!", rating: 5 }
  ];

  // ---------- Render ----------
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#333" }}>
      <Navbar />

      {/* Hero */}
      <section className="hero" style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", height: "80vh", background: "#000" }}>
        <div className="video-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", maxWidth: "1400px", gap: 15, padding: "0 20px" }}>
          {["Vid1.mp4","Vid2.mp4","Vid3.mp4"].map((v,i) => (
            <div key={i} style={{ flex:1, overflow:"hidden", borderRadius:15, boxShadow:"0 8px 20px rgba(0,0,0,0.4)" }}>
              <video src={`Videos/${v}`} autoPlay muted loop style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            </div>
          ))}
        </div>
        <div className="Caption" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", color:"#fff", textAlign:"center", textShadow:"0 3px 15px rgba(0,0,0,0.7)", maxWidth:"90%" }}>
          <h1 style={{ fontSize:"3em", lineHeight:"1.2em" }}>Welcome to a Taste You'll Never Forget</h1>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="carousel-section" style={{ padding:"60px 20px", background:"#fff8f0" }}>
        <h2 style={{ textAlign:"center", fontSize:"2.5em", color:"#d35400", marginBottom:40 }}>Popular Dishes</h2>
        <div className="carousel-wrapper" style={{ position:"relative" }}>
          <button className="nav left" onClick={scrollLeft}>&#10094;</button>
          <div ref={carouselRef} className="carousel" style={{ display:"flex", gap:20, overflowX:"auto", scrollBehavior:"smooth", padding:"10px 0" }}>
            {popularDishes.map((img,i) => <img key={i} src={img} alt={`Dish ${i}`} className="carousel-item" />)}
          </div>
          <button className="nav right" onClick={scrollRight}>&#10095;</button>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ textAlign:"center", padding:"60px 20px", background:"#f8f0e3" }}>
        <h2 style={{ fontSize:"2.5em", marginBottom:20, color:"#b87b1c" }}>Ready to Taste the Best?</h2>
        <p style={{ fontSize:"1.2em", marginBottom:30 }}>Order online or browse our menu to explore delicious options!</p>
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          <a href="/order" style={{ padding:"15px 30px", background:"#d35400", color:"#fff", borderRadius:8, fontWeight:"bold", textDecoration:"none" }}>Order Now</a>
          <a href="/menu" style={{ padding:"15px 30px", background:"#b8860b", color:"#fff", borderRadius:8, fontWeight:"bold", textDecoration:"none" }}>View Menu</a>
        </div>
      </section>

      {/* Special Offers */}
      <section style={{ textAlign:"center", padding:"40px 20px", background:"#fff" }}>
        <h2 style={{ color:"#d35400", fontSize:"2rem", marginBottom:40 }}>Special Offers</h2>
        <div style={{ display:"flex", justifyContent:"center", gap:30, flexWrap:"wrap" }}>
          {specialOffers.map((o,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 10px 25px rgba(0,0,0,0.1)", maxWidth:320, textAlign:"center", cursor:"pointer", transition:"transform 0.3s, box-shadow 0.3s" }}
              onMouseOver={e => { e.currentTarget.style.transform="translateY(-5px) scale(1.03)"; e.currentTarget.style.boxShadow="0 15px 30px rgba(0,0,0,0.15)"; }}
              onMouseOut={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,0.1)"; }}
            >
              <img src={o.image} alt={o.title} style={{ width:"100%", height:200, objectFit:"cover" }} />
              <div style={{ padding:20 }}>
                <h3 style={{ color:"#d35400", margin:"0 0 10px", fontSize:"1.3rem" }}>{o.title}</h3>
                <p style={{ color:"#555", margin:0, fontSize:"0.95rem" }}>{o.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" style={{ background:"#fdf4e7", padding:"60px 20px", textAlign:"center" }}>
        <h2 style={{ fontSize:"2.5em", marginBottom:40, color:"#b87b1c" }}>What Our Customers Say</h2>
        <div style={{ display:"flex", justifyContent:"center", gap:25, flexWrap:"wrap" }}>
          {testimonials.map((t,i) => (
            <div key={i} style={{ background:"#fff", padding:25, borderRadius:15, boxShadow:"0 6px 15px rgba(0,0,0,0.1)", maxWidth:320, transition:"transform 0.3s", cursor:"pointer" }}
              onMouseOver={e => e.currentTarget.style.transform="translateY(-5px)"}
              onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
            >
              <p style={{ fontStyle:"italic", marginBottom:15 }}>"{t.review}"</p>
              <h4 style={{ margin:0 }}>{t.name}</h4>
              <p style={{ color:"#d35400", margin:"5px 0 0" }}>{'★'.repeat(Math.floor(t.rating))}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer id="contact" />

      {/* Scroll-to-top */}
      {showScroll && <button onClick={scrollTop} style={{ position:"fixed", right:25, bottom:25, width:50, height:50, borderRadius:"50%", background:"#d35400", color:"#fff", fontSize:24, border:"none", cursor:"pointer", boxShadow:"0 4px 8px rgba(0,0,0,0.2)" }}>↑</button>}

      {/* Cookie Banner */}
      {showCookie && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.98)", boxShadow:"0 -2px 15px rgba(0,0,0,0.15)", padding:"15px 20px", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", zIndex:10000, fontSize:"0.95rem" }}>
          <p style={{ margin:0, maxWidth:"75%" }}>🍪 We use cookies to improve your experience. <a href="/privacy" style={{ color:"#d35400", textDecoration:"underline" }}>Learn more</a>.</p>
          <div style={{ display:"flex", gap:10, marginTop:10 }}>
            <button onClick={declineCookies} style={{ background:"transparent", border:"1px solid #d35400", color:"#d35400", padding:"6px 12px", borderRadius:6, cursor:"pointer" }}>Decline</button>
            <button onClick={acceptCookies} style={{ background:"#d35400", border:"none", color:"white", padding:"6px 12px", borderRadius:6, cursor:"pointer" }}>Accept</button>
          </div>
        </div>
      )}
    </div>
  );
}
