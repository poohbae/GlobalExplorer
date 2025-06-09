import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function FavouritePage() {
  const [user, setUser] = useState({username: '',});
  const [countries, setCountries] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [weathers, setWeathers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('countries');
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
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const fetchCountries = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/favouriteCountry`, { headers });
        setCountries(res.data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };

    const fetchAttractions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/favouriteAttraction`, { headers });
        setAttractions(res.data);
      } catch (error) {
        console.error('Failed to fetch attractions:', error);
      }
    };

    const fetchWeathers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/favouriteWeather`, { headers });
        setWeathers(res.data);
      } catch (error) {
        console.error('Failed to fetch weathers:', error);
      }
    };

    fetchCountries();
    fetchAttractions();
    fetchWeathers();
  }, []);

  const handleDeleteCountry = async (country, index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this country?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteCountry/${country._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setCountries((prev) => prev.filter((_, i) => i !== index));
      alert('Country deleted successfully');
    } catch (err) {
      console.error('Failed to delete country:', err);
      alert('Failed to delete country');
    }
  };

  const handleDeleteAttraction = async (attraction, index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this attraction?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteAttraction/${attraction._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setAttractions((prev) => prev.filter((_, i) => i !== index));
      alert('Attraction deleted successfully');
    } catch (err) {
      console.error('Failed to delete attraction:', err);
      alert('Failed to delete attraction');
    }
  };

  const handleDeleteWeather = async (weather, index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this weather?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteWeather/${weather._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setWeathers((prev) => prev.filter((_, i) => i !== index));
      alert('Weather deleted successfully');
    } catch (err) {
      console.error('Failed to delete weather:', err);
      alert('Failed to delete weather');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      <main style={{ flex: 1, padding: '1rem' }}>
        {/* Tabs */}
        <div className="tab-container">
          {['countries', 'attractions', 'weathers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Countries Section */}
        {selectedTab === 'countries' && (
          <>
            <h2 style={{ textAlign: 'center' }}>Favourite Countries</h2>
            <div className="attractions-grid">
              {countries.length === 0 && <p>No favourite countries found.</p>}
              {countries.map((country, index) => (
                <div key={index} className="attraction-card"
                onClick={() =>
                    navigate(`/countryDetail/${encodeURIComponent(country.countryName)}`)
                  }
                >
                  <h2>{country.countryName}</h2>
                  <img
                    src={country.countryFlag}
                    alt={`${country.countryName} flag`}
                    className="country-flag"
                  />
                  <p><strong>Region:</strong> {country.countryRegion}</p>
                  <p><strong>Capital:</strong> {country.countryCapital}</p>
                  <p><strong>Languages:</strong> {country.countryLanguage}</p>
                  <p><strong>Translations:</strong> {country.countryTranslations}</p>
                  <p><strong>Currency:</strong> {country.countryCurrency}</p>
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteCountry(country, index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Attractions Section */}
        {selectedTab === 'attractions' && (
          <>
            <h2 style={{ textAlign: 'center' }}>Favourite Attractions</h2>
            <div className="attractions-grid">
              {attractions.length === 0 && <p>No favourite attractions found.</p>}
              {attractions.map((attraction, index) => (
                <div
                  key={index}
                  className="attraction-card"
                  onClick={() =>
                    navigate(`/attractionDetail/${encodeURIComponent(attraction.countryName)}/${encodeURIComponent(attraction.attractionTitle)}`)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {attraction.attractionThumbnail && (
                    <img src={attraction.attractionThumbnail} alt={attraction.attractionTitle} className="attraction-img" />
                  )}
                  <h4>{attraction.attractionTitle}</h4>
                  <p>{attraction.attractionDescription || 'No description available'}</p>
                  <p><strong>Rating:</strong> {attraction.attractionRating ?? 'N/A'} / 5</p>
                  <p><strong>Reviews:</strong> {attraction.attractionReview ?? 'N/A'}</p>
                  <p><strong>Price:</strong> {attraction.attractionPrice ?? 'N/A'}</p>
                  <p>
                    <strong>Country:</strong> {attraction.countryName}
                    <img
                      src={attraction.countryFlag}
                      alt={`${attraction.countryName} flag`}
                      style={{ width: '20px', height: '15px', marginLeft: '5px', verticalAlign: 'middle' }}
                    />
                  </p>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteAttraction(attraction, index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Weathers Section */}
        {selectedTab === 'weathers' && (
          <>
            <h2 style={{ textAlign: 'center' }}>Favourite Weathers</h2>
            <div className="attractions-grid">
              {weathers.length === 0 && <p>No favourite weathers found.</p>}
              {weathers.map((weather, index) => (
                <div key={index} className="attraction-card">
                  <p><strong>{weather.countryName}</strong></p>
                  <p>{weather.weatherDate}</p>
                  <p><strong>Avg Temp:</strong> {weather.weatherTemperature}°C</p>
                  <p><strong>Max:</strong> {weather.weatherMax} km/h</p>
                  <p><strong>Min:</strong> {weather.weatherMin} km/h</p>
                  <p><strong>Avg Humidity:</strong> {weather.weatherHumidity}</p>
                  <p><strong>Wind:</strong> {weather.weatherWind}%</p>   
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteWeather(weather, index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default FavouritePage;
