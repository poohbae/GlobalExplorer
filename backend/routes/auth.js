const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, email, country, password, confirmPassword } = req.body;

  if (!username || !email || !country || !password ||!confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Fetch currency info from the API
    const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true&fields=currencies`;
    const response = await axios.get(apiUrl);

    const countryData = response.data[0];
    const currencyKeys = Object.keys(countryData.currencies);
    const currency = currencyKeys[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, country, currency });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    // Check for duplicate key error (unique fields)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  // Search user by username or email
  const user = await User.findOne({ 
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, username: user.username } });
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { country, password } = req.body;
    const updateFields = {};

    // Handle country update
    if (country) {
      updateFields.country = country;

      // Fetch currency for the new country
      const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true&fields=currencies`;
      const response = await axios.get(apiUrl);

      const countryData = response.data[0];
      const currencyKeys = Object.keys(countryData.currencies);
      const currency = currencyKeys[0];

      updateFields.currency = currency;
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true
    }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
