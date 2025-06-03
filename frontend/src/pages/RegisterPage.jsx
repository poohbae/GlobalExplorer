import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', country: '', password: '', confirmPassword:'' });
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch country names only
    const fetchCountries = async () => {
      try {
        const res = await axios.get('https://restcountries.com/v3.1/all');
        // Map to extract the common country names and sort alphabetically
        const countryNames = res.data
          .map(country => country.name.common)
          .sort((a, b) => a.localeCompare(b));
        setCountries(countryNames);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };
  
  const validateEmail = (email) => {
    // Basic regex for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const hasChanges = () => {
    return (
      form.username.trim() &&
      form.email.trim() &&
      form.country.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim()
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!hasChanges()) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(form.email.trim())) {
      setError('Email is in the wrong format');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8888/api/auth/register', form);
      alert('Registered! Proceed to login.');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <div className="background">
      <div className="overlay">
        <div className="modal">
          <h2 style={{ textAlign: 'center' }}>Welcome to Global Explorer!</h2>
          <h3 style={{ marginBottom: 50, textAlign: 'center' }}>Register as New User</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%', margin: '0 auto'}}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="input-field"
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />

            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  top: '30%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  color: '#000',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={{
                  position: 'absolute',
                  top: '30%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  color: '#000',
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
            
            <br></br>
            <button type="submit" className="auth-button" disabled={loading || !hasChanges()}>
              Register
            </button>
          </form>

          <p style={{ marginTop: '30px', textAlign: 'center' }}>
            
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2e5ca0', fontWeight: 'bold' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
