import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';  // no curly braces here
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

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
      } catch {
        navigate('/login');
      }
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Navbar />

      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Welcome {user?.username || 'User'}!</h1>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
