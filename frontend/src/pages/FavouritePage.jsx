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
  const [editingCountry, setEditingCountry] = useState(null);
  const [editCountryForm, setEditCountryForm] = useState({
    countryName: '',
    countryRegion: '',
    countryCapital: '',
    countryLanguage: '',
    countryTranslations: '',
    countryCurrency: ''
  });

  const [attractions, setAttractions] = useState([]);
  const [editingAttraction, setEditingAttraction] = useState(null);
  const [editAttractionForm, setEditAttractionForm] = useState({
    countryName: '',
    attractionTitle: '',
    attractionDescription: '',
    attractionRating: '',
    attractionReview: '',
    attractionPrice: ''
  });

  const [weathers, setWeathers] = useState([]);
  const [editingWeather, setEditingWeather] = useState(null);
  const [editWeatherForm, setEditWeatherForm] = useState({
    countryName: '',
    weatherDate: '',
    weatherConditionText: '',
    weatherAvgTemp: '',
    weatherMaxTemp: '',
    weatherMinTemp: '',
    weatherHumidity: '',
    weatherWind: ''
  });

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

  const handleEditCountry = (country) => {
    setEditingCountry(country);
    setEditCountryForm({
      countryName: country.countryName,
      countryRegion: country.countryRegion,
      countryCapital: country.countryCapital,
      countryLanguage: country.countryLanguage,
      countryTranslations: country.countryTranslations,
      countryCurrency: country.countryCurrency
    });
  };

  const handleEditAttraction = (attraction) => {
    setEditingAttraction(attraction);
    setEditAttractionForm({
      countryName: attraction.countryName,
      attractionTitle: attraction.attractionTitle,
      attractionDescription: attraction.attractionDescription,
      attractionRating: attraction.attractionRating,
      attractionReview: attraction.attractionReview,
      attractionPrice: attraction.attractionPrice
    });
  };

  const handleEditWeather = (weather) => {
    setEditingWeather(weather);
    setEditWeatherForm({
      countryName: weather.countryName,
      weatherDate: weather.weatherDate,
      weatherConditionText: weather.weatherConditionText,
      weatherAvgTemp: weather.weatherAvgTemp,
      weatherMaxTemp: weather.weatherMaxTemp,
      weatherMinTemp: weather.weatherMinTemp,
      weatherHumidity: weather.weatherHumidity,
      weatherWind: weather.weatherWind
    });
  };


  const handleCountryFormChange = (e) => {
    setEditCountryForm({
      ...editCountryForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAttractionFormChange = (e) => {
    setEditAttractionForm({
      ...editAttractionForm,
      [e.target.name]: e.target.value
    });
  };

  const handleWeatherFormChange = (e) => {
    setEditWeatherForm({
      ...editWeatherForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateCountry = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/favouriteCountry/${editingCountry._id}`,
        editCountryForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCountries(prev =>
        prev.map(c => c._id === editingCountry._id ? res.data : c)
      );

      alert('Country updated successfully');
      setEditingCountry(null);
    } catch (err) {
      console.error('Failed to update country:', err);
      alert('Failed to update country');
    }
  };

  const handleUpdateAttraction = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/favouriteAttraction/${editingAttraction._id}`,
        editAttractionForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAttractions(prev =>
        prev.map(c => c._id === editingAttraction._id ? res.data : c)
      );

      alert('Attraction updated successfully');
      setEditingAttraction(null);
    } catch (err) {
      console.error('Failed to update attraction:', err);
      alert('Failed to update attraction');
    }
  };

  const handleUpdateWeather = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/favouriteWeather/${editingWeather._id}`,
        editWeatherForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setWeathers(prev =>
        prev.map(w => w._id === editingWeather._id ? res.data : w)
      );

      alert('Weather updated successfully');
      setEditingWeather(null);
    } catch (err) {
      console.error('Failed to update weather:', err);
      alert('Failed to update weather');
    }
  };

  const handleDeleteCountry = async (country) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this country?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteCountry/${country._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setCountries((prev) => prev.filter((c) => c._id !== country._id)); 
      alert('Country deleted successfully');
    } catch (err) {
      console.error('Failed to delete country:', err);
      alert('Failed to delete country');
    }
  };

  const handleDeleteAttraction = async (attraction) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this attraction?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteAttraction/${attraction._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setAttractions((prev) => prev.filter((a) => a._id !== attraction._id));
      alert('Attraction deleted successfully');
    } catch (err) {
      console.error('Failed to delete attraction:', err);
      alert('Failed to delete attraction');
    }
  };

  const handleDeleteWeather = async (weather) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this weather?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/favouriteWeather/${weather._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setWeathers((prev) => prev.filter((w) => w._id !== weather._id));
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
              {countries.map((country) => (
                <div key={country._id} className="attraction-card"
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
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleEditCountry(country);
                      }}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleDeleteCountry(country);
                      }}                
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
              {attractions.map((attraction) => (
                <div
                  key={attraction._id} className="attraction-card"
                  onClick={() =>
                    navigate(`/attractionDetail/${encodeURIComponent(attraction.countryName)}/${encodeURIComponent(attraction.attractionTitle)}`)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {attraction.attractionThumbnail && (
                    <img src={attraction.attractionThumbnail} alt={attraction.attractionTitle} className="attraction-img" />
                  )}
                  <h2>{attraction.attractionTitle}</h2>
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
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleEditAttraction(attraction);
                      }}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleDeleteAttraction(attraction);
                      }}                
                    >
                      Delete
                    </button>
                  </div>
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
              {weathers.map((weather) => (
                <div key={weather._id}  className="attraction-card">
                  <h2>{weather.weatherDate}</h2>
                  <p><strong>{weather.countryName}</strong></p>
                  <img src={weather.countryFlag} alt={`${weather.countryName} flag`} className="country-flag" />
                  <p><strong>Avg Temp:</strong> {weather.weatherAvgTemp}°C</p>
                  <p><strong>Max:</strong> {weather.weatherMaxTemp} km/h</p>
                  <p><strong>Min:</strong> {weather.weatherMinTemp} km/h</p>
                  <p><strong>Avg Humidity:</strong> {weather.weatherHumidity}</p>
                  <p><strong>Wind:</strong> {weather.weatherWind}%</p>   
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleEditWeather(weather);
                      }}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent parent onClick
                        handleDeleteWeather(weather);
                      }}                
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {editingCountry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Country</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateCountry(); }}>
              <label>
                Country Name:
                <input type="text" className="input-field" name="countryName" value={editCountryForm.countryName} disabled />
              </label>
              <label>
                Region:
                <input type="text" className="input-field" name="countryRegion" value={editCountryForm.countryRegion} onChange={handleCountryFormChange} />
              </label>
              <label>
                Capital:
                <input type="text" className="input-field" name="countryCapital" value={editCountryForm.countryCapital} onChange={handleCountryFormChange} />
              </label>
              <label>
                Language:
                <input type="text" className="input-field" name="countryLanguage" value={editCountryForm.countryLanguage} onChange={handleCountryFormChange} />
              </label>
              <label>
                Translations:
                <input type="text" className="input-field" name="countryTranslations" value={editCountryForm.countryTranslations} onChange={handleCountryFormChange} />
              </label>
              <label>
                Currency:
                <input type="text" className="input-field" name="countryCurrency" value={editCountryForm.countryCurrency} onChange={handleCountryFormChange} />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="auth-button">Save</button>
                <button type="button" className="auth-button" onClick={() => setEditingCountry(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAttraction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Attraction</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAttraction(); }}>
              <label>
                Country Name:
                <input type="text" className="input-field" name="countryName" value={editAttractionForm.countryName} disabled />
              </label>
              <label>
                Title:
                <input type="text" className="input-field" name="attractionTitle" value={editAttractionForm.attractionTitle} disabled />
              </label>
              <label>
                Description:
                <input type="text" className="input-field" name="attractionDescription" value={editAttractionForm.attractionDescription} onChange={handleAttractionFormChange} />
              </label>
              <label>
                Rating:
                <input type="text" className="input-field" name="attractionRating" value={editAttractionForm.attractionRating} onChange={handleAttractionFormChange} />
              </label>
              <label>
                Review:
                <input type="text" className="input-field" name="attractionReview" value={editAttractionForm.attractionReview} onChange={handleAttractionFormChange} />
              </label>
              <label>
                Price:
                <input type="text" className="input-field" name="attractionPrice" value={editAttractionForm.attractionPrice} onChange={handleAttractionFormChange} />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="auth-button">Save</button>
                <button type="button" className="auth-button" onClick={() => setEditingAttraction(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingWeather && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Country</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateWeather(); }}>
              <label>
                Country Name:
                <input type="text" className="input-field" name="countryName" value={editWeatherForm.countryName} disabled />
              </label>
              <label>
                Date:
                <input type="text" className="input-field" name="weatherDate" value={editWeatherForm.weatherDate} disabled />
              </label>
              <label>
                Condition:
                <input type="text" className="input-field" name="weatherConditionText" value={editWeatherForm.weatherConditionText} onChange={handleWeatherFormChange} />
              </label>
              <label>
                Average Temperature:
                <input type="text" className="input-field" name="weatherAvgTemp" value={editWeatherForm.weatherAvgTemp} onChange={handleWeatherFormChange} />
              </label>
              <label>
                Max Temperature:
                <input type="text" className="input-field" name="weatherMaxTemp" value={editWeatherForm.weatherMaxTemp} onChange={handleWeatherFormChange} />
              </label>
              <label>
                Min Temperature:
                <input type="text" className="input-field" name="weatherMinTemp" value={editWeatherForm.weatherMinTemp} onChange={handleWeatherFormChange} />
              </label>
              <label>
                Humidity:
                <input type="text" className="input-field" name="weatherHumidity" value={editWeatherForm.weatherHumidity} onChange={handleWeatherFormChange} />
              </label>
              <label>
                Wind:
                <input type="text" className="input-field" name="weatherWind" value={editWeatherForm.weatherWind} onChange={handleWeatherFormChange} />
              </label>       
              <div className="modal-buttons">
                <button type="submit" className="auth-button">Save</button>
                <button type="button" className="auth-button" onClick={() => setEditingWeather(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default FavouritePage;
