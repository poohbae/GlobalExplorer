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
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios
      .get('http://localhost:8888/api/auth/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(profileRes => {
        if (profileRes.data) setUser(profileRes.data);

        // Fetch attractions for country
        return axios.get(`http://localhost:8888/api/auth/attractions?country=${encodeURIComponent(countryName)}`);
      })
      .then(attractionRes => {
        const sight = attractionRes.data.sights.find(
          (s) => s.title.toLowerCase() === decodeURIComponent(attractionName).toLowerCase()
        );
        if (!sight) throw new Error('Attraction not found');
        setAttraction(sight);

        // Fetch country flag
        return axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=flags`
        );
      })
      .then(countryRes => {
        if (countryRes.data && countryRes.data[0]?.flags?.png) {
          setCountryFlag(countryRes.data[0].flags.png);
        }

        // Fetch weather data
        const weatherApiKey = '8ae2c9ab7adf4818818134257250606';
        return axios.get(
          `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(countryName)}&days=7`
        );
      })
      .then(weatherRes => {
        setWeather(weatherRes.data);
      })
      .catch(err => {
        setError('Attraction details not available');
        console.error(err);
      });
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
        countryName: countryName,
        countryFlag: countryFlag || '',
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
      if (err.response?.status === 409) {
        alert('This attraction is already in your favourites.');
      } else {
        console.error(err);
        alert('Failed to add favourite');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />

      <main style={{ flex: 1, padding: '1rem' }}>
        <Link to={`/attraction`} className="back-link">← Back to Home</Link>

        {/* Attraction Info + Current Weather */}
          <div className="row row-top">
            {/* Attraction Info */}
            <div className="column info">
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
            </div>

            {/* 7-Day Forecast */}
            {weather && (
              <div className="row forecast-row">
                <h4 className="forecast-title">7-Day Forecast</h4>
                <div className="forecast-grid">
                  {weather.forecast.forecastday.map((day, index) => (
                    <div key={index} className="forecast-card">
                      <p><strong>{day.date}</strong></p>
                      <img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} />
                      <p>{day.day.condition.text}</p>
                      <p>Max: {day.day.maxtemp_c}°C</p>
                      <p>Min: {day.day.mintemp_c}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
                type="button"
                className="add-button"
                style={{ marginTop: 10 }}
                onClick={() => handleAddToFavourite(attraction)}
                >
                Add to Favourite
            </button>
          </div>
        </main>
      <Footer />
    </div>
  );
}

export default AttractionDetail;
