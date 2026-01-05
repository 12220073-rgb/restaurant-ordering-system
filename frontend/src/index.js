import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/style.css';
import { BrowserRouter } from 'react-router-dom';

// Create React root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with BrowserRouter and future flags to remove warnings
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
