const mongoose = require('mongoose');

// name
// code
// emoji
// unicode
// image
const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  emoji: {
    type: String
  },
  unicode: {
    type: String
  },
  image: {
    type: String
  }
}, {timestamps: true});

module.exports = mongoose.model('Country', CountrySchema);