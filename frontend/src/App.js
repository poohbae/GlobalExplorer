import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CountryPage from './pages/CountryPage';
import CountryDetailPage from './pages/CountryDetailPage';
import AttractionPage from './pages/AttractionPage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import WeatherPage from './pages/WeatherPage';
import FavouritePage from './pages/FavouritePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={token ? <HomePage /> : <Navigate to="/login" />}
        />        
        <Route path="/country" element={<CountryPage />} />
        <Route path="/countryDetail/:countryName" element={<CountryDetailPage />} />
        <Route path="/attraction" element={<AttractionPage />} />
        <Route path="/attractionDetail/:countryName/:attractionName" element={<AttractionDetailPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/favourite" element={<FavouritePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
