import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CountryDetail() {
  const { countryName } = useParams();
  const [user, setUser] = useState({username: '', });
  const [country, setCountry] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profileRes = await axios.get('http://localhost:8888/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
            });
          setUser(profileRes.data);
        }

        // Fetch country by full name
        const countryRes = await axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=name,region,capital,languages,translations,currencies,flags`
        );
        setCountry(countryRes.data[0]);

        // Fetch country attractions
        const attractionRes = await axios.get(`http://localhost:8888/api/auth/attractions?country=${encodeURIComponent(countryName)}`);
        const topSights = attractionRes.data.sights?.slice(0, 5) || []; // Limit to 5
        setAttractions(topSights);
      } catch (err) {
        setError('Country not found');
      }
    };

    fetchCountry();
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
      <Link to="/" className='back-link'>← Back to Home</Link>
      <div style={{ textAlign:'center' }}>
        <h2>{country.name.common}</h2>
        <img
            src={country.flags.svg || country.flags.png}
            alt={`${country.name.common} flag`}
            style={{ width: '200px', borderRadius: '10px', marginBottom: '1rem' }}
        />
        <p><strong>Region:</strong> {region}</p>
        <p><strong>Capital:</strong> {capital}</p>
        <p><strong>Languages:</strong> {languages}</p>
        <p><strong>Translations:</strong> {translations}</p>
        <p><strong>Currency:</strong> {currencies}</p>

        {attractions.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
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
      </div>
      <Footer />
    </div>
  );
}

export default CountryDetail;
