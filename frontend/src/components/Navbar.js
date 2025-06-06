import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/country"
            className={`navbar-link ${location.pathname === '/country' ? 'active' : ''}`}
          >
            Countries
          </Link>
          <Link
            to="/attraction"
            className={`navbar-link ${location.pathname === '/attraction' ? 'active' : ''}`}
          >
            Attractions
          </Link>
          <Link
            to="/weather"
            className={`navbar-link ${location.pathname === '/weather' ? 'active' : ''}`}
          >
            Weather
          </Link>
          <Link
            to="/favourite"
            className={`navbar-link ${location.pathname === '/favourite' ? 'active' : ''}`}
          >
            Favourites
          </Link>
          <Link
            to="/profile"
            className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
