const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const Country = require('../models/Country');
const Attraction = require('../models/Attraction');
const Weather = require('../models/Weather');

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

// Add country to database
router.post('/addCountryToFavourite', verifyToken, async (req, res) => {
  const { userID, countryName, countryFlag, countryRegion, countryCapital,
    countryLanguage, countryTranslations, countryCurrency
  } = req.body;

  if (!userID || !countryName || !countryFlag || !countryRegion || !countryCapital || !countryLanguage || !countryTranslations || !countryCurrency) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the country already exists for the user
    const existing = await Country.findOne({
      userID: req.user.id,
      countryName
    });

    if (existing) {
      return res.status(409).json({ message: 'Country already in favourites' });
    }

    const country = new Country({
      userID: req.user.id, countryName, countryFlag, countryRegion, countryCapital,
      countryLanguage, countryTranslations, countryCurrency
    });

    await country.save();
    res.status(201).json({ message: 'Country added to favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get country details
router.get('/favouriteCountry', verifyToken, async (req, res) => {
  try {
    // Fetch user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch attractions by userID
    const countries = await Country.find({ userID: req.user.id });

    res.json(countries);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update country
router.put('/favouriteCountry/:id', verifyToken, async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Ensure the user owns the country
    if (country.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Update fields - exclude countryName and countryFlag as they are not editable
    const { countryRegion, countryCapital, countryLanguage, countryTranslations, countryCurrency } = req.body;

    country.countryRegion = countryRegion;
    country.countryCapital = countryCapital;
    country.countryLanguage = countryLanguage;
    country.countryTranslations = countryTranslations;
    country.countryCurrency = countryCurrency;

    await country.save();

    res.json({ message: 'Country updated successfully', country });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete country from database
router.delete('/favouriteCountry/:id', verifyToken, async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Ensure the user owns the attraction
    if (country.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await country.deleteOne();

    res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add attraction to database
router.post('/addAttractionToFavourite', verifyToken, async (req, res) => {
  const { userID, countryName, countryFlag, attractionTitle, attractionDescription,
    attractionRating, attractionReview, attractionPrice, attractionThumbnail
  } = req.body;

  if (!userID || !countryName || !countryFlag || !attractionTitle || !attractionDescription || !attractionRating || !attractionReview || !attractionPrice || !attractionThumbnail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the attraction already exists for the user
    const existing = await Attraction.findOne({
      userID: req.user.id,
      attractionTitle,
      countryName
    });

    if (existing) {
      return res.status(409).json({ message: 'Attraction already in favourites' });
    }

    const attraction = new Attraction({
      userID: req.user.id, countryName, countryFlag, attractionTitle, attractionDescription,
      attractionRating, attractionReview, attractionPrice, attractionThumbnail
    });

    await attraction.save();
    res.status(201).json({ message: 'Attraction added to favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attraction details
router.get('/favouriteAttraction', verifyToken, async (req, res) => {
  try {
    // Fetch user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch attractions by userID
    const attractions = await Attraction.find({ userID: req.user.id });

    res.json(attractions);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update attraction
router.put('/favouriteAttraction/:id', verifyToken, async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    // Ensure the user owns the attraction
    if (attraction.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Update fields - exclude countryName and attractionTitle as they are not editable
    const { attractionDescription, attractionRating, attractionReview, attractionPrice } = req.body;

    attraction.attractionDescription = attractionDescription;
    attraction.attractionRating = attractionRating;
    attraction.attractionReview = attractionReview;
    attraction.attractionPrice = attractionPrice;

    await attraction.save();

    res.json({ message: 'Attraction updated successfully', country });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete attraction from database
router.delete('/favouriteAttraction/:id', verifyToken, async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    // Ensure the user owns the attraction
    if (attraction.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await attraction.deleteOne();

    res.json({ message: 'Attraction deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add weather to database
router.post('/addWeatherToFavourite', verifyToken, async (req, res) => {
  const { userID, countryName, weatherDate, weatherConditionText, weatherConditionIcon,
    weatherAvgTemp, weatherMaxTemp, weatherMinTemp, weatherHumidity, weatherWind
  } = req.body;

  if (!userID || !countryName || !weatherDate || !weatherConditionText || !weatherConditionIcon || !weatherAvgTemp || !weatherMaxTemp || !weatherMinTemp || !weatherHumidity || !weatherWind) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the weather already exists for the user
    const existing = await Weather.findOne({
      userID: req.user.id,
      countryName,
      weatherDate
    });

    if (existing) {
      return res.status(409).json({ message: 'Weather already in favourites' });
    }

    const weather = new Weather({
      userID: req.user.id, countryName, weatherDate, weatherConditionText, weatherConditionIcon,
      weatherAvgTemp, weatherMaxTemp, weatherMinTemp, weatherHumidity, weatherWind 
    });

    await weather.save();
    res.status(201).json({ message: 'Weather added to favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weather details
router.get('/favouriteWeather', verifyToken, async (req, res) => {
  try {
    // Fetch user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch attractions by userID
    const weathers = await Weather.find({ userID: req.user.id });

    res.json(weathers);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update weather
router.put('/favouriteWeather/:id', verifyToken, async (req, res) => {
  try {
    const weather = await Weather.findById(req.params.id);

    if (!weather) {
      return res.status(404).json({ error: 'Weather not found' });
    }

    // Ensure the user owns the weather
    if (weather.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Update fields - exclude countryName and attractionTitle as they are not editable
    const { weatherConditionText, weatherAvgTemp, weatherMaxTemp, weatherMinTemp, weatherHumidity, weatherWind } = req.body;

    weather.weatherConditionText = weatherConditionText;
    weather.weatherAvgTemp = weatherAvgTemp;
    weather.weatherMaxTemp = weatherMaxTemp;
    weather.weatherMinTemp = weatherMinTemp;
    weather.weatherHumidity = weatherHumidity;
    weather.weatherWind = weatherWind;

    await weather.save();

    res.json({ message: 'Weather updated successfully', country });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete attraction from database
router.delete('/favouriteWeather/:id', verifyToken, async (req, res) => {
  try {
    const weather = await Weather.findById(req.params.id);

    if (!weather) {
      return res.status(404).json({ error: 'Weather not found' });
    }

    // Ensure the user owns the attraction
    if (weather.userID.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await weather.deleteOne();

    res.json({ message: 'Weather deleted successfully' });
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
