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

function HomePage() {
  const [user, setUser] = useState(null);
  const [topCountries, setTopCountries] = useState([]);
  const [topAttractions, setTopAttractions] = useState([]);
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

        const shuffled = allCountries.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setTopCountries(selected);

        let allAttractions = [];

        // Only fetch attractions for the first 5 countries
        const maxAttractions = 5;

        // Recursive function to chain the requests one by one
        const fetchAttractionForIndex = (index) => {
          if (index >= maxAttractions || index >= selected.length) {
            setTopAttractions(allAttractions);
            return Promise.resolve();
          }

          return axios.get(`${process.env.REACT_APP_API_URL}/api/auth/attractions?country=${encodeURIComponent(selected[index].name)}`)
            .then(res => {
              const topSights = res.data.sights?.slice(0, 1) || [];
              allAttractions.push(...topSights.map(sight => ({
                ...sight,
                country: selected[index].name
              })));
            })
            .catch(err => {
              console.warn(`Failed to fetch attractions for ${selected[index].name}`, err);
            })
            .then(() => fetchAttractionForIndex(index + 1)); // Chain next request
        };

        return fetchAttractionForIndex(0);
      })
      .catch(error => {
        console.error('Failed to fetch countries or attractions:', error);
      });
  }, []);
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={user?.username} />
      <Navbar />

      {/* Carousel */}
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
        </Carousel>

        {/* Countries */}
        <div className='country-container' style={{ marginTop: '2rem', marginBottom: '2rem' }} >
          <h2 style={{ textAlign: 'center' }}>Top Countries to Visit</h2>
          <div className="country-grid">
            {topCountries.map((country, index) => (
              <div key={index} className="country-card" onClick={() => navigate(`/countryDetail/${encodeURIComponent(country.name)}`)}>
                <img src={country.flag}
                  alt={`${country.name} flag`}
                  className="country-flag" 
                />
                <p className="country-name">{country.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attractions */}
        <div className='country-container'>
          <h2 style={{ textAlign: 'center' }}>Top Attractions to Visit</h2>
          <div className="attractions-grid">
            {topAttractions.map((sight, index) => (
              <div key={index} className="attraction-card" onClick={() => navigate(`/attractionDetail/${sight.country}/${encodeURIComponent(sight.title)}`)}>
                {sight.thumbnail && (
                  <img src={sight.thumbnail} alt={sight.title} className="attraction-img" />
                )}
                <h4>{sight.title}</h4>
                <p>{sight.description || 'No description available'}</p>
                <p><strong>Rating:</strong> {sight.rating ?? 'N/A'} / 5</p>
                <p><strong>Reviews:</strong> {sight.reviews ?? 'N/A'}</p>
                <p><strong>Price:</strong> {sight.price ?? 'N/A'}</p>
                <p>
                  <strong>Country:</strong>{' '}
                  {sight.country}
                  <img
                    src={topCountries.find(c => c.name === sight.country)?.flag}
                    alt={`${sight.country} flag`}
                    style={{ width: '20px', height: '15px', marginLeft: '5px', verticalAlign: 'middle' }}
                  />
                </p>
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
