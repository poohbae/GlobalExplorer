import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8888/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      alert('Logged in!');
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2 style={{ marginBottom: 20, textAlign: 'center' }}>GlobalExplorer</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />

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
                marginLeft: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                userSelect: 'none',
                background: 'none',
                border: 'none',
                color: '#4caf50',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Eye icon (password visible)
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
                </svg>
              ) : (
                // Eye off icon (password hidden)
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a18.45 18.45 0 0 1 5.56-5.94"></path>
                  <path d="M1 1l22 22"></path>
                  <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24"></path>
                  <path d="M14.47 14.47a3 3 0 0 1-4.24-4.24"></path>
                  <path d="M21.94 21.94A10.94 10.94 0 0 0 12 19c-6 0-10-7-10-7a18.45 18.45 0 0 0 5.56-5.94"></path>
                </svg>
              )}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="button-primary">
            Login
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4caf50', fontWeight: 'bold' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
