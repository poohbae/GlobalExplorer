import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token');
        navigate('/login');
      }
    }
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome {user?.email || 'User'}!</h1>
      <p>You are logged in to Global Explorer 🌍</p>
    </div>
  );
}

export default HomePage;
