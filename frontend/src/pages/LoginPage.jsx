import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
    <div className="background">
      <div className="overlay">
        <div className="modal">
          <h2 style={{ textAlign: 'center' }}>GlobalExplorer</h2>
          <h3 style={{ marginBottom: 50, textAlign: 'center' }}>Register as New User</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
            <br />

            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="input-field"
                style={{ width: '100%'}}
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

            {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
            <br />

            <button type="submit" className="button-primary">
              Login
            </button>
          </form>

          <p style={{ marginTop: '30px', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#00a3ff', fontWeight: 'bold' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
