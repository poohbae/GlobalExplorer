const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const Favourite = require('../models/Favourite');

// Register
router.post('/register', async (req, res) => {
  const { username, email, country, password, confirmPassword } = req.body;

  if (!username || !email || !country || !currency || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, country });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
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

// Call country attractions API
const attractionApiKey = '2631d090e9891dfbd03633f73578e7818c829426f633cf41eeaa54b8bfc38085';

// Utility function to add a delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/api/auth/attractions', async (req, res) => {
  const country = req.query.country;

  try {
    // Delay before making the SerpAPI request
    await sleep(2000); // 2 seconds delay

    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `${country} Attractions`,
        google_domain: 'google.com',
        api_key: attractionApiKey
      }
    });

    const sights = response.data?.top_sights?.sights || [];
    res.json({ sights }); // Return only relevant data
  } catch (err) {
    console.error('Error fetching from SerpAPI:', err.message);
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

// Add country attraction to database
router.post('/addToFavourite', verifyToken, async (req, res) => {
  const { userID, countryName, countryFlag, attractionName, attractionDescription,
    attractionRating, attractionReview, attractionPrice, attractionThumbnail
  } = req.body;

  if (!userID || !countryName || !countryFlag || !attractionName || !attractionDescription || !attractionRating || !attractionReview || !attractionPrice || !attractionThumbnail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const favourite = new Favourite({
      userID: req.user.id, countryName, countryFlag, attractionName, attractionDescription,
      attractionRating, attractionReview, attractionPrice, attractionThumbnail
    });

    await favourite.save();
    res.status(201).json({ message: 'Attraction added to favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get favourites details
router.get('/favourite', verifyToken, async (req, res) => {
  try {
    // Fetch user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch favourites by userID
    const favourites = await Favourite.find({ userID: req.user.id });

    res.json(favourites);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user details
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

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { country, password } = req.body;
    const updateFields = {};

    // Handle country update
    if (country) {
      updateFields.country = country;
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
