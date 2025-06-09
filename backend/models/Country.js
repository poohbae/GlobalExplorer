const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  userID: { type: String, required: true },
  countryName: { type: String, required: true },
  countryFlag: { type: String, required: true },
  countryRegion: { type: String, required: true },
  countryCapital: { type: String, required: true },
  countryLanguage: { type: String, required: true },
  countryTranslations: { type: String, required: true },
  countryCurrency: { type: String, required: true }
});

module.exports = mongoose.model('Country', CountrySchema);
