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

  if (!username || !email || !country || !password || !confirmPassword) {
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

// Call attractions API
const attractionApiKey = '68aff6cba7b2f5aa3aff372f06392c7e12510f0d030c9e20e0df62d2510cb6c6';

router.get('/api/auth/attractions', async (req, res) => {
  const country = req.query.country;

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `${country} Attractions`,
        google_domain: 'google.com',
        api_key: attractionApiKey
      }
    });

    const sights = response.data?.top_sights?.sights || [];
    res.json({ sights });

  } catch (err) {
    console.error('Error fetching from SerpAPI:', err.message);

    // Return empty sights array with 200 status (successful response)
    res.json({ sights: [] });
  }
});

// Add attraction to database
router.post('/addToFavourite', verifyToken, async (req, res) => {
  const { userID, countryName, countryFlag, attractionTitle, attractionDescription,
    attractionRating, attractionReview, attractionPrice, attractionThumbnail
  } = req.body;

  if (!userID || !countryName || !countryFlag || !attractionTitle || !attractionDescription || !attractionRating || !attractionReview || !attractionPrice || !attractionThumbnail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the attraction already exists for the user
    const existing = await Favourite.findOne({
      userID: req.user.id,
      attractionTitle,
      countryName
    });

    if (existing) {
      return res.status(409).json({ message: 'Attraction already in favourites' });
    }

    const favourite = new Favourite({
      userID: req.user.id, countryName, countryFlag, attractionTitle, attractionDescription,
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

// Delete attraction from database
router.delete('/favourite/:id', verifyToken, async (req, res) => {
  try {
    const favourite = await Favourite.findById(req.params.id);

    if (!favourite) {
      return res.status(404).json({ error: 'Favourite not found' });
    }

    // Ensure the user owns the favourite
    if (favourite.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await favourite.deleteOne();

    res.json({ message: 'Favourite deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
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

    // Handle user update
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
