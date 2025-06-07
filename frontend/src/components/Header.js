import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../header-logo.svg';

export default function Header({username}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token or any auth info from localStorage
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header>
      <nav className='header'>
        <div>
          <Link to="/">
            <img src={logo} alt="Logo" className='logo' />
          </Link>
        </div>
        <div className='header-title'>
          {`Welcome to Global Explorer${username ? `, ${username}` : ''}`}
        </div>
        <div>
          <button
            onClick={handleLogout}
            className='auth-button'
            style={{ marginLeft: '40px', marginRight: '40px', width: '100px'}}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
