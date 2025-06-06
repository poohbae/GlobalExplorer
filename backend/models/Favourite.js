const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  country: { type: String, required: true },
  attractionName: { type: String, required: true },
  attractionDescription: { type: String, required: true },
  attractionRating: { type: String, required: true },
  attractionReview: { type: String, required: true },
  attractionPrice: { type: String, required: true }
});

module.exports = mongoose.model('Favourite', FavouriteSchema);
