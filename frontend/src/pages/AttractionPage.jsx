import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function AttractionPage() {
  const [user, setUser] = useState(null);
  const [countries, setCountries] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    axios.get('https://restcountries.com/v3.1/all?fields=name,flags')
      .then(countryRes => {
        const allCountries = countryRes.data.map(country => ({
          name: country.name.common,
          flag: country.flags?.png || ''
        }));

        // Shuffle and pick 10 countries
        const shuffled = allCountries.sort(() => 0.5 - Math.random());
        const selectedCountries = shuffled.slice(0, 10);
        setCountries(selectedCountries);

        let allAttractions = [];

        // Define a function to fetch attractions one by one recursively
        const fetchAttractionsChain = (index) => {
          if (index >= selectedCountries.length) {
            // Done fetching all
            setAttractions(allAttractions);
            return Promise.resolve();
          }

          const country = selectedCountries[index];
          return axios.get(`http://localhost:8888/api/auth/attractions?country=${encodeURIComponent(country.name)}`)
            .then(res => {
              const topSights = res.data.sights?.slice(0, 2) || [];
              allAttractions.push(...topSights.map(sight => ({
                ...sight,
                country: country.name
              })));
            })
            .catch(() => {
              console.warn(`Failed to fetch attractions for ${country.name}`);
            })
            .then(() => fetchAttractionsChain(index + 1));  // Chain next request
        };

        return fetchAttractionsChain(0);
      })
      .catch(error => {
        console.error('Failed to fetch countries or attractions:', error);
      });
  }, []);
  
  const filteredAttractions = attractions.filter(attraction =>
    attraction.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Attractions */}
        <h2 style={{ textAlign: 'center' }}>Attractions to Visit</h2>
          <div className="attractions-grid">
            {filteredAttractions.map((attraction, index) => (
              <div
                key={index}
                className="attraction-card"
                onClick={() => navigate(`/attractionDetail/${encodeURIComponent(attraction.country)}/${encodeURIComponent(attraction.title)}`)}
                style={{ cursor: 'pointer' }}
              >
                {attraction.thumbnail && (
                  <img src={attraction.thumbnail} alt={attraction.title} className="attraction-img" />
                )}
                <h4>{attraction.title}</h4>
                <p>{attraction.description || 'No description available'}</p>
                <p><strong>Rating:</strong> {attraction.rating ?? 'N/A'} / 5</p>
                <p><strong>Reviews:</strong> {attraction.reviews ?? 'N/A'}</p>
                <p><strong>Price:</strong> {attraction.price ?? 'N/A'}</p>
                <p>
                    <strong>Country:</strong> {attraction.country}
                    <img
                        src={countries.find(c => c.name === attraction.country)?.flag}
                        alt={`${attraction.country} flag`}
                        style={{ width: '20px', height: '15px', marginLeft: '5px', verticalAlign: 'middle' }}
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

export default AttractionPage;
