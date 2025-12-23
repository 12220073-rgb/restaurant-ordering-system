// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import About from './pages/About';
import OrderConfirmation from './pages/OrderConfirmation';
import Admin from './pages/Admin';

// New Pages (for footer links)
import Promotions from './pages/Promotions';
import Blog from './pages/Blog';
import Partners from './pages/Partners';
import Careers from './pages/Careers';
import FAQs from './pages/FAQs';

/* ===================================
   🔒 Route Protection Components
=================================== */

// ProtectedRoute ensures user is logged in
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// AdminProtectedRoute ensures user is admin and logged in
function AdminProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  return isLoggedIn && userRole === 'admin' ? children : <Navigate to="/home" replace />;
}

/* ===================================
   🌐 App Component
=================================== */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes for Logged-in Users */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route
          path="/promotions"
          element={
            <ProtectedRoute>
              <Promotions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <Partners />
            </ProtectedRoute>
          }
        />

        <Route
          path="/careers"
          element={
            <ProtectedRoute>
              <Careers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faqs"
          element={
            <ProtectedRoute>
              <FAQs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Admin-only Route */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          }
        />

        {/* Default Route: redirect unknown paths to Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
