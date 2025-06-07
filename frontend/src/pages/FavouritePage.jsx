import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function FavouritePage() {
  const [user, setUser] = useState({username: '',});
  const [favourites, setFavourites] = useState([]);
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

  useEffect(() => {
    const fetchFavourites = async () => {
        try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/favourite`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });

        setFavourites(res.data);
        } catch (error) {
        console.error('Failed to fetch favourites:', error);
        }
    };

    fetchFavourites();
  }, []);

  const handleDelete = async (favourite, index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this favourite?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favourite/${favourite._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFavourites((prev) => prev.filter((_, i) => i !== index));
      alert('Favourite deleted successfully');

      navigate('/');
    } catch (err) {
      console.error('Failed to delete favourite:', err);
      alert('Failed to delete favourite');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      <main style={{ flex: 1, padding: '1rem' }}>
        <h2 style={{ textAlign: 'center' }}>Favourite Attractions</h2>
          <div className="attractions-grid">
            {favourites.length === 0 && <p>No favourites found.</p>}
            {favourites.map((favourite, index) => (
              <div
                key={index}
                className="attraction-card"
                onClick={() => navigate(`/attractionDetail/${encodeURIComponent(favourite.countryName)}/${encodeURIComponent(favourite.attractionTitle)}`)}
                style={{ cursor: 'pointer' }}
              >
                {favourite.attractionThumbnail && (
                  <img src={favourite.attractionThumbnail} alt={favourite.attractionTitle} className="attraction-img" />
                )}
                <h4>{favourite.attractionTitle}</h4>
                <p>{favourite.attractionDescription || 'No description available'}</p>
                <p><strong>Rating:</strong> {favourite.attractionRating ?? 'N/A'} / 5</p>
                <p><strong>Reviews:</strong> {favourite.attractionReview ?? 'N/A'}</p>
                <p><strong>Price:</strong> {favourite.attractionPrice ?? 'N/A'}</p>
                <p>
                    <strong>Country:</strong> {favourite.countryName}
                    <img
                        src={favourite.countryFlag}
                        alt={`${favourite.countryName} flag`}
                        style={{ width: '20px', height: '15px', marginLeft: '5px', verticalAlign: 'middle' }}
                        />
                </p> 
                <button
                    type="button"
                    className="delete-button"
                    id={`delete-${index}`}
                    onClick={() => handleDelete(favourite, index)}
                  >
                    Delete
                  </button>
              </div>
            ))}
          </div>    
      </main>
      
      <Footer />
    </div>
  );
}

export default FavouritePage;
