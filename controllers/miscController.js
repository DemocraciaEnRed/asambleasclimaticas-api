const Country = require('../models/country');

exports.getCountries = async (req, res) => {
  try {
    /**
     * Retrieves a list of countries.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of country objects.
     */
    const countries = await Country.find({}).sort({code: 1});
    return res.json(countries);
  } catch (error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
  }
}