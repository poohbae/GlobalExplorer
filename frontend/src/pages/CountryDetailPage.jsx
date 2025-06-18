import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    (token
      ? axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : Promise.resolve(null)
    )
      .then(profileRes => {
        if (profileRes) setUser(profileRes.data);

        return axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=name,region,capital,languages,translations,currencies,flags`
        );
      })
      .then(countryRes => {
        setCountry(countryRes.data[0]);

        const weatherApiKey = '8ae2c9ab7adf4818818134257250606';
        return axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(countryName)}&days=7`
        );
      })
      .then(weatherRes => {
        setWeather(weatherRes.data);

        // Separate return for attractions — allow failure without breaking others
        return axios
          .get(`${process.env.REACT_APP_API_URL}/api/auth/attractions?country=${encodeURIComponent(countryName)}`)
          .then(attractionRes => {
            const topSights = attractionRes.data.sights?.slice(0, 3) || [];
            setAttractions(topSights);
          })
          .catch(err => {
            console.warn('Attraction API failed:', err.message);
            setAttractions([]); // Still set to avoid undefined
          });
      })
      .catch(err => {
        console.error(err);
        setError('Country not found or failed to load');
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

  const handleAddCountryToFavourite = async (country) => {
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
        countryRegion: region,
        countryCapital: capital,
        countryLanguage: languages,
        countryTranslations: translations,
        countryCurrency: currencies
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/addCountryToFavourite`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Country added to favourites!');
    } catch (err) {
      if (err.response?.status === 409) {
        alert('This country is already in your favourites.');
      } else {
        console.error(err);
        alert('Failed to add favourite');
      }
    }
  };

  const handleAddAttractionToFavourite = async (attraction) => {
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
        attractionTitle: attraction.title,
        attractionDescription: attraction.description || 'No description',
        attractionRating: attraction.rating?.toString() || 'N/A',
        attractionReview: attraction.reviews?.toString() || 'N/A',
        attractionPrice: attraction.price || 'N/A',
        attractionThumbnail: attraction.thumbnail || 'N/A'
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/addAttractionToFavourite`, payload, {
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

  const handleAddWeatherToFavourite = async (day) => {
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
        weatherDate: day.date,
        weatherConditionText: day.day.condition.text,
        weatherConditionIcon: day.day.condition.icon,
        weatherAvgTemp: day.day.avgtemp_c.toString(),
        weatherMaxTemp: day.day.maxtemp_c.toString(),
        weatherMinTemp: day.day.mintemp_c.toString(),
        weatherAvgHumidity: day.day.avghumidity.toString(),
        weatherWind: day.day.maxwind_kph.toString()
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/addWeatherToFavourite`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert('Weather added to favourites!');
    } catch (err) {
      if (err.response?.status === 409) {
        alert('This weather is already in your favourites.');
      } else {
        console.error(err);
        alert('Failed to add favourite');
      }
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
                style={{ display: 'block', margin: '0 auto' }}
              />     
            <p><strong>Region:</strong> {region}</p>
            <p><strong>Capital:</strong> {capital}</p>
            <p><strong>Languages:</strong> {languages}</p>
            <p><strong>Translations:</strong> {translations}</p>
            <p><strong>Currency:</strong> {currencies}</p>
            <div style={{ textAlign: 'center' }}>
              <button
                  type="button"
                  className="add-button"
                  style={{ marginTop: 10 }}
                  onClick={() => handleAddCountryToFavourite(country)}
                  >
                  Add to Favourite
              </button>
            </div>
          </div>

          {/* Weather Info */}
          {weather && (
            <div className="column weather-info">
              <h3>Current Weather</h3>
              <p><strong>Local Time:</strong> {weather.location.localtime}</p>
              <p>
                {weather.current.condition.text}
                <img
                  src={`https:${weather.current.condition.icon}`}
                  alt={weather.current.condition.text}
                  className="weather-icon"
                />
              </p>
              <p><strong>Temperature:</strong> {weather.current.temp_c}°C</p>
              <p><strong>Feels Like:</strong> {weather.current.feelslike_c}°C</p>
              <p><strong>Humidity:</strong> {weather.current.humidity}%</p>
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
                  <p><strong>Max:</strong> {day.day.maxtemp_c}°C</p>
                  <p><strong>Min:</strong> {day.day.mintemp_c}°C</p>
                  <p><strong>Humidity:</strong> {day.day.avghumidity}%</p>
                  <p><strong>Wind:</strong> {day.day.maxwind_kph} kph</p>      
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => handleAddWeatherToFavourite(day)}
                  >
                    Add to Favourite
                  </button>
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
              {attractions.map((attraction, index) => (
                <div key={index} className="attraction-card" onClick={() => navigate(`/attractionDetail/${encodeURIComponent(countryName)}/${encodeURIComponent(attraction.title)}`)}>
                  {attraction.thumbnail && (
                    <img src={attraction.thumbnail} alt={attraction.title} className="attraction-img" />
                  )}
                  <h4>{attraction.title}</h4>
                  <p>{attraction.description || 'No description available'}</p>
                  <p><strong>Rating:</strong> {attraction.rating ?? 'N/A'} / 5</p>
                  <p><strong>Reviews:</strong> {attraction.reviews ?? 'N/A'}</p>
                  <p><strong>Price:</strong> {attraction.price ?? 'N/A'}</p>
                  <button
                    type="button"
                    className="add-button"
                    id={`add-fav-${index}`}
                    onClick={() => handleAddAttractionToFavourite(attraction, index)}
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
