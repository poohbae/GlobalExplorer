const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  countryName: { type: String, required: true },
  weatherDate: { type: String, required: true },
  weatherConditionText: { type: String, required: true },
  weatherConditionIcon: { type: String, required: true },
  weatherTemperature: { type: String, required: true },
  weatherHumidity: { type: String, required: true },
  weatherWind: { type: String, required: true },
  weatherMax: { type: String, required: true },
  weatherMin: { type: String, required: true }
});

module.exports = mongoose.model('Weather', WeatherSchema);
