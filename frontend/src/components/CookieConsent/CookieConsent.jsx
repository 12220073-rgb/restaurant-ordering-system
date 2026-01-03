import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "../../styles/style.css";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Cookies.get("cookieConsent")) setVisible(true);
  }, []);

  const handleChoice = (choice) => {
    Cookies.set("cookieConsent", choice, { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        🍪 We use cookies to improve your experience.{" "}
        <a href="/privacy" style={{ color: "#d35400", textDecoration: "underline" }}>
          Learn more
        </a>.
      </p>

      <div className="cookie-buttons">
        <button onClick={() => handleChoice("declined")}>Decline</button>
        <button onClick={() => handleChoice("accepted")}>Accept</button>
      </div>
    </div>
  );
}
