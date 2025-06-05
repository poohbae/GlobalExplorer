import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import countryImg from '../images/country.jpg';
import attractionImg from '../images/attraction.jpg';
import weatherImg from '../images/weather.jpg';

function HomePage() {
  const [user, setUser] = useState(null);
  const [countries, setCountries] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
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
    const fetchCountries = async () => {
      try {
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags');
        const allCountries = res.data.map(country => ({
          name: country.name.common,
          flag: country.flags?.png || ''
        }));
        setCountries(allCountries);

        // Randomly select 10 countries
        const shuffled = allCountries.sort(() => 0.5 - Math.random());
        setTopCountries(shuffled.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const filteredCountries = topCountries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      <main style={{ flex: 1, padding: '1rem' }}>
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={3000}
          stopOnHover
          showArrows
        >
          <div
            onClick={() => navigate('/country')}
            className="carousel-slide"
            style={{ backgroundImage: `url(${countryImg})` }}
          >
            <button className="carousel-button">Explore by Country</button>
          </div>

          <div
            onClick={() => navigate('/attraction')}
            className="carousel-slide"
            style={{ backgroundImage: `url(${attractionImg})` }}
          >
            <button className="carousel-button">Explore by Attractions</button>
          </div>

          <div
            onClick={() => navigate('/weather')}
            className="carousel-slide"
            style={{ backgroundImage: `url(${weatherImg})` }}
          >
            <button className="carousel-button">Explore by Weather</button>
          </div>
        </Carousel>

        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className='country-container'>
          <h2 style={{ textAlign: 'center' }}>Top Countries to Visit</h2>
          <div className="country-grid">
            {filteredCountries.map((country, index) => (
              <div key={index} className="country-card" onClick={() => navigate(`/countryDetail/${encodeURIComponent(country.name)}`)}>
                <div
                  className="country-flag"
                  style={{ backgroundImage: `url(${country.flag})` }}
                ></div>
                <p className="country-name">{country.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
