import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CountryDetail() {
  const { countryName } = useParams();
  const [user, setUser] = useState({username: '', });
  const [country, setCountry] = useState(null);
  const [weather, setWeather] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    (token ? axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null))
      .then(profileRes => {
        if (profileRes) setUser(profileRes.data);

        return axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=name,region,capital,languages,translations,currencies,flags`);
      })
      .then(countryRes => {
        setCountry(countryRes.data[0]);

        const weatherApiKey = '8ae2c9ab7adf4818818134257250606';
        return axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(countryName)}&days=7`);
      })
      .then(weatherRes => {
        setWeather(weatherRes.data);

        return axios.get(`${process.env.REACT_APP_API_URL}/api/auth/attractions?country=${encodeURIComponent(countryName)}`);
      })
      .then(attractionRes => {
        const topSights = attractionRes.data.sights?.slice(0, 5) || [];
        setAttractions(topSights);
      })
      .catch(err => {
        setError('Country not found');
      });
  }, [countryName]);

  if (error) return <p>{error}</p>;
  if (!country) return <p style={{ padding: '1rem' }}>Loading Country details...</p>;

  const region = country.region || 'N/A';
  const capital = country.capital ? country.capital.join(', ') : 'N/A';
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
  const translations = country.translations
    ? [country.translations.eng?.common, country.translations.msa?.common, country.translations.zho?.common]
        .filter(Boolean)  // remove undefined/null values
        .join(', ')
    : 'N/A';
  const currencies = country.currencies
  ? Object.keys(country.currencies).join(', ')
  : 'N/A';

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
        countryFlag: country.flags.svg || country.flags.png || '',
        attractionName: sight.title,
        attractionDescription: sight.description || 'No description',
        attractionRating: sight.rating?.toString() || 'N/A',
        attractionReview: sight.reviews?.toString() || 'N/A',
        attractionPrice: sight.price || 'N/A',
        attractionThumbnail: sight.thumbnail || 'N/A'
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/addToFavourite`, payload, {
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
    <div className="page-container">
      <Header username={user?.username} />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Link to="/" className="back-link">← Back to Home</Link>

        {/* Country Info + Current Weather */}
        <div className="row row-top">
          {/* Country Info */}
          <div className="column info">
            <h2>{country.name.common}</h2>
            <img
              src={country.flags.svg || country.flags.png}
              alt={`${country.name.common} flag`}
              className="country-flag"
            />
            <p><strong>Region:</strong> {region}</p>
            <p><strong>Capital:</strong> {capital}</p>
            <p><strong>Languages:</strong> {languages}</p>
            <p><strong>Translations:</strong> {translations}</p>
            <p><strong>Currency:</strong> {currencies}</p>
          </div>

          {/* Weather Info */}
          {weather && (
            <div className="column weather-info">
              <h3>Current Weather in {weather.location.country}</h3>
              <p><strong>Local Time:</strong> {weather.location.localtime}</p>
              <p>
                {weather.current.condition.text}
                <img
                  src={`https:${weather.current.condition.icon}`}
                  alt={weather.current.condition.text}
                  className="weather-icon"
                />
              </p>
              <p><strong>Temperature:</strong> {weather.current.temp_c} °C</p>
              <p><strong>Feels Like:</strong> {weather.current.feelslike_c} °C</p>
              <p><strong>Humidity:</strong> {weather.current.humidity} %</p>
              <p><strong>Wind:</strong> {weather.current.wind_kph} kph ({weather.current.wind_dir})</p>
            </div>
          )}
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

        {/* Attractions */}
        {attractions.length > 0 && (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ textAlign: 'center' }}>Top Attractions in {countryName}</h3>
            <div className="attractions-grid">
              {attractions.map((sight, index) => (
                <div key={index} className="attraction-card">
                  {sight.thumbnail && (
                    <img src={sight.thumbnail} alt={sight.title} className="attraction-img" />
                  )}
                  <h4>{sight.title}</h4>
                  <p>{sight.description || 'No description available'}</p>
                  <p><strong>Rating:</strong> {sight.rating ?? 'N/A'} / 5</p>
                  <p><strong>Reviews:</strong> {sight.reviews ?? 'N/A'}</p>
                  <p><strong>Price:</strong> {sight.price ?? 'N/A'}</p>
                  <button
                    type="button"
                    className="add-button"
                    id={`add-fav-${index}`}
                    onClick={() => handleAddToFavourite(sight, index)}
                  >
                    Add to Favourite
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CountryDetail;
