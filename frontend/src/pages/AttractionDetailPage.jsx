import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AttractionDetail() {
  const { countryName, attractionName } = useParams();
  const [user, setUser] = useState({username: '',});
  const [attraction, setAttraction] = useState([]);
const [countryFlag, setCountryFlag] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profileRes = await axios.get('http://localhost:8888/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(profileRes.data);
        }

        // Fetch attraction
        const attractionRes = await axios.get(
          `http://localhost:8888/api/auth/attractions?country=${encodeURIComponent(countryName)}`
        );
        const sight = attractionRes.data.sights.find(
          (s) => s.title.toLowerCase() === decodeURIComponent(attractionName).toLowerCase()
        );

        if (!sight) throw new Error('Attraction not found');
        setAttraction(sight);

        // Fetch country flag from restcountries API
        const countryRes = await axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=flags`
        );
        if (countryRes.data && countryRes.data[0]?.flags?.png) {
          setCountryFlag(countryRes.data[0].flags.png);
        }
      } catch (err) {
        setError('Attraction details not available');
      }
    };

    fetchAttraction();
  }, [countryName, attractionName]);

  if (error) return <p>{error}</p>;
  if (!attraction) return <p style={{ padding: '1rem' }}>Loading attraction details...</p>;

  const handleAddToFavourite = async (sight) => {
    try {
      const userID = localStorage.getItem('userID');

      if (!userID) {
        alert('User not logged in');
        return;
      }

      const payload = {
        userID,
        country: countryName,
        attractionName: sight.title,
        attractionDescription: sight.description || 'No description',
        attractionRating: sight.rating?.toString() || 'N/A',
        attractionReview: sight.reviews?.toString() || 'N/A',
        attractionPrice: sight.price || 'N/A'
      };

      await axios.post('http://localhost:8888/api/auth/addToFavourite', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Attraction added to favourites!');
    } catch (err) {
      console.error(err);
      alert('Failed to add favourite');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Link to={`/attraction`} className="back-link">← Back to Home</Link>
      <div style={{ textAlign: 'center' }}>
        <h2>{attraction.title}</h2>
        {attraction.thumbnail && (
          <img
            src={attraction.thumbnail}
            alt={attraction.title}
            style={{ width: '300px', borderRadius: '10px', marginBottom: '1rem' }}
          />
        )}
        <p><strong>Description:</strong> {attraction.description || 'No description'}</p>
        <p><strong>Rating:</strong> {attraction.rating ?? 'N/A'} / 5</p>
        <p><strong>Reviews:</strong> {attraction.reviews ?? 'N/A'}</p>
        <p><strong>Price:</strong> {attraction.price ?? 'N/A'}</p>
        <p>
          <strong>Country:</strong> {countryName}
          {countryFlag && (
            <img
              src={countryFlag}
              alt={`${countryName} flag`}
              style={{ width: '20px', height: '15px', marginLeft: '5px', verticalAlign: 'middle' }}
            />
          )}
        </p>
        <button
            type="button"
            className="add-button"
            style={{ marginTop: 10 }}
            onClick={() => handleAddToFavourite(attraction)}
            >
            Add to Favourite
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default AttractionDetail;
