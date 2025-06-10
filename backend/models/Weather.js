const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  countryName: { type: String, required: true },
  countryFlag: { type: String, required: true },
  weatherDate: { type: String, required: true },
  weatherConditionText: { type: String, required: true },
  weatherConditionIcon: { type: String, required: true },
  weatherAvgTemp: { type: String, required: true },
  weatherMaxTemp: { type: String, required: true },
  weatherMinTemp: { type: String, required: true },
  weatherHumidity: { type: String, required: true },
  weatherWind: { type: String, required: true }
});

module.exports = mongoose.model('Weather', WeatherSchema);
