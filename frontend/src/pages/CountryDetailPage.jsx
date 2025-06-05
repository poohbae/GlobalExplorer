import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CountryDetail() {
  const { countryName } = useParams();
  const [user, setUser] = useState({
      username: '',
      currency: '',
    });
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        setLoading(true);
        setError(null);

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
        const res = await axios.get(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=name,region,capital,languages,translations,currencies,flags`
        );
        setCountry(res.data[0]);

      } catch (err) {
        setError('Country not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countryName]);

  if (loading) return <p style={{ padding: '1rem' }}>Loading Country Details...</p>;
  if (error) return <p>{error}</p>;
  if (!country) return null;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Link to="/" className='back-link'>← Back to Home</Link>
      <div style={{ padding: '1rem' }}>
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
        <button
            type="submit"
            className="add-button"
            style={{ marginTop: 10 }}
            >
            Add to Favourite
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default CountryDetail;
