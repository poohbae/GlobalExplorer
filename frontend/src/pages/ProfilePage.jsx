import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    country: '',
  });
  const [initialCountry, setInitialCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [updateDisabled, setUpdateDisabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser({
        username: res.data.username,
        email: res.data.email,
        country: res.data.country || '',
      });
      setInitialCountry(res.data.country || '');

      // Chain: fetch countries after profile loaded
      return axios.get('https://restcountries.com/v3.1/all?fields=name');
    })
    .then(res => {
      const countryNames = res.data.map(c => c.name.common).sort((a, b) => a.localeCompare(b));
      setCountries(countryNames);
    })
    .catch(err => console.error('Failed to load data:', err))
    .finally(() => setLoading(false));
  }, []);

  const handleCountryChange = e => {
    setUser(prev => ({ ...prev, country: e.target.value }));
    setError('');
    setSuccess('');
    setUpdateDisabled(false);
  };

  const handleNewPasswordChange = e => {
    setNewPassword(e.target.value);
    setError('');
    setSuccess('');
    setUpdateDisabled(false);
  };

  const handleConfirmNewPasswordChange = e => {
    setConfirmNewPassword(e.target.value);
    setError('');
    setSuccess('');
    setUpdateDisabled(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const hasChanges = () => {
    const countryChanged = user.country && user.country !== initialCountry;
    const passwordEntered = newPassword.length > 0;
    return countryChanged || passwordEntered;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation: Only run if user entered a new password
    if ((newPassword || confirmNewPassword) && (newPassword.length < 8 || confirmNewPassword.length < 8)) {
      setError('Passwords must be at least 8 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    const token = localStorage.getItem('token'); 
    const updateData = {};

    // Only add fields that were changed
    if (user.country) updateData.country = user.country;
    if (newPassword) updateData.password = newPassword;

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
      setError('');
      setUpdateDisabled(true);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError('Failed to update profile. Try again.');
      setSuccess('');
    }
  };

    return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header username={user?.username} />
        <Navbar />

        <main style={{ flex: 1 }}>
          <div
          className="modal"
          style={{
              maxWidth: 400,
              margin: 'auto',
              marginTop: '50px', // Moves modal closer to the top
          }}
          >
          <h2 style={{ textAlign: 'center' }}>Your Profile</h2>
          <br />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <label>Username</label>
              <input
              value={user.username}
              readOnly
              className="input-field"
              />

              <label>Email</label>
              <input
              value={user.email}
              readOnly
              className="input-field"
              />

              <label>Country:</label>
              <select
              value={user.country}
              onChange={handleCountryChange}
              className="input-field"
              required
              >
              <option value="">Select a country</option>
              {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
              ))}
              </select>

              <label htmlFor="password">Enter New Password:</label>
              <div style={{ position: 'relative', width: '100%' }}>
              <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className="input-field"
                  style={{ width: '100%' }}
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

              {newPassword && (
              <>
                  <label>Confirm New Password:</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                  <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordChange}
                  className="input-field"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="password-toggle-button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
                </div>
              </>
              )}

              {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
              {success && <p className="success-message" style={{ textAlign: 'center', color: 'green' }}>{success}</p>}

              <button
                type="submit"
                className="auth-button"
                style={{ marginTop: 10 }}
                disabled={loading || !hasChanges() || updateDisabled}
              >
                Update
              </button>
          </form>
          </div>
        </main>

        <Footer />
    </div>
    );
}