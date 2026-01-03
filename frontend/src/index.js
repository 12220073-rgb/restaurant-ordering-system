import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/style.css'; // Global CSS

// Create React root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
