import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <div className="logo-text">Wedakam <span style={{color: 'var(--brand-cyan)'}}>●</span></div>
        </div>

        <nav className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#product" className="nav-link">Product</a>
          <a href="#about" className="nav-link">About Us</a>
        </nav>

        <div className="header-actions">
          <Link to="/register" className="pill-btn btn-cyan" style={{ padding: '0.6rem 1.5rem' }}>Register</Link>
          <Link to="/login" className="pill-btn btn-cyan" style={{ padding: '0.6rem 1.5rem' }}>Log in</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
