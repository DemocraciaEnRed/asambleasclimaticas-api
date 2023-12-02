const Country = require('../models/country');

exports.get = async (req, res) => {
  try {
    const countries = await Country.find({}).sort({code: 1});
    return res.json(countries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: error.message});
  }
}