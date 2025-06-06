import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function FavouritePage() {
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
        try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8888/api/auth/favourite', {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      <main style={{ flex: 1, padding: '1rem' }}>
        <h2 style={{ textAlign: 'center' }}>Attractions to Visit</h2>
          <div className="attractions-grid">
            {favourites.length === 0 && <p>No favourites found.</p>}
            {favourites.map((favourite, index) => (
              <div
                key={index}
                className="attraction-card"
                style={{ cursor: 'pointer' }}
              >
                {favourite.thumbnail && (
                  <img src={favourite.thumbnail} alt={favourite.title} className="attraction-img" />
                )}
                <h4>{favourite.title}</h4>
                <p>{favourite.description || 'No description available'}</p>
                <p><strong>Rating:</strong> {favourite.rating ?? 'N/A'} / 5</p>
                <p><strong>Reviews:</strong> {favourite.reviews ?? 'N/A'}</p>
                <p><strong>Price:</strong> {favourite.price ?? 'N/A'}</p>
                <p>
                    <strong>Country:</strong> {favourite.countryName}
                    <img
                        src={favourite.countryFlag}
                        alt={`${favourite.countryName} flag`}
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', marginBottom: '8px' }}
                        />
                </p>
              </div>
            ))}
          </div>    
      </main>
      <Footer />
    </div>
  );
}

export default FavouritePage;
