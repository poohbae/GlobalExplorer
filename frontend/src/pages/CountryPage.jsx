import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function CountryPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
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
    const fetchCountries = async () => {
      try {
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags');
        const allCountries = res.data.map(country => ({
          name: country.name.common,
          flag: country.flags?.png || ''
        }));

        // Pick 20 random countries
        const selectedCountries = [];
        const copyCountries = [...allCountries];
        while (selectedCountries.length < 20 && copyCountries.length > 0) {
          const randomIndex = Math.floor(Math.random() * copyCountries.length);
          selectedCountries.push(copyCountries.splice(randomIndex, 1)[0]);
        }

        setCountries(selectedCountries);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      {/* Search Bar */}
      <main style={{ flex: 1, padding: '1rem' }}>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Countries */}
        <h2 style={{ textAlign: 'center' }}>Countries to Visit</h2>
        <div className="country-grid">
          {filteredCountries.map((country, index) => (
            <div key={index} className="country-card" onClick={() => navigate(`/countryDetail/${encodeURIComponent(country.name)}`)}>
              <img src={country.flag}
                  alt={`${country.name} flag`}
                  className="country-flag" 
                />
              <p className="country-name">{country.name}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CountryPage;
