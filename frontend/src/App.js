import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CountryDetailPage from './pages/CountryDetailPage';

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/countryDetail/:countryName" element={<CountryDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
