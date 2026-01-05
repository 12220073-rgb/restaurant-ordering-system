// src/components/CookieConsent.jsx
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "../../styles/style.css";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  // Show banner only if consent cookie is not set
  useEffect(() => {
    if (!Cookies.get("cookieConsent")) setVisible(true);
  }, []);

  // Handle user's choice and store in cookie
  const handleChoice = (choice) => {
    Cookies.set("cookieConsent", choice, { expires: 365, sameSite: "Lax" });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        🍪 We use cookies to enhance your experience.{" "}
        <a
          href="/privacy"
          style={{ color: "#d35400", textDecoration: "underline" }}
        >
          Learn more
        </a>
        .
      </p>

      <div className="cookie-buttons">
        <button
          className="cookie-btn decline"
          onClick={() => handleChoice("declined")}
        >
          Decline
        </button>
        <button
          className="cookie-btn accept"
          onClick={() => handleChoice("accepted")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
