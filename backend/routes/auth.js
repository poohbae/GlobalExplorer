const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, country } = req.body;

  if (!username || !email || !password || !country) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, country });
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
    if (country) updateFields.country = country;
    if (password) {
      // Hash password before saving (assuming bcrypt)
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
