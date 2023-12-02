// const mongoose = require('mongoose')
const Migration = require('../models/migration')
// Add the models that the migration will use
const Country = require('../models/country')
// load the json file "migrations/data/countries.json"
const countries = require('../data/countries');

// Define the migration
const migrationName = 'setup-countries' // Replace with your migration name

module.exports = {
  async run () {
    try {
      // ========= START OF MIGRATION CODE ============
      // ==============================================
      // Check if the migration has already been applied
      const existingMigration = await Migration.findOne({ name: migrationName })
  
      if (existingMigration) {
        // Already applied, skip
        return
      }
  
      console.log(`* Running migration ${migrationName}`)
      // ==============================================
      // Write your migration down here 
      
      let skip = false
      // check if the countries already exist
      const existingCountries = await Country.find();
      if(existingCountries.length > 0) {
        skip = true;
      }
  
      if(skip) {
        console.log('Countries already exist! Cannot continue, relations might be broken.')
        return
      } else {    
          const latinAmericanCountries = [
          { name: 'Argentina', code: 'AR' },
          { name: 'Bolivia', code: 'BO' },
          { name: 'Brasil', code: 'BR' },
          { name: 'Chile', code: 'CL' },
          { name: 'Colombia', code: 'CO' },
          { name: 'Costa Rica', code: 'CR' },
          { name: 'Cuba', code: 'CU' },
          { name: 'República Dominicana', code: 'DO' },
          { name: 'Ecuador', code: 'EC' },
          { name: 'El Salvador', code: 'SV' },
          { name: 'Guatemala', code: 'GT' },
          { name: 'Honduras', code: 'HN' },
          { name: 'México', code: 'MX' },
          { name: 'Nicaragua', code: 'NI' },
          { name: 'Panamá', code: 'PA' },
          { name: 'Paraguay', code: 'PY' },
          { name: 'Perú', code: 'PE' },
          { name: 'Uruguay', code: 'UY' },
          { name: 'Venezuela', code: 'VE' },
        ];
        // Create the countries
        for(const country of latinAmericanCountries) {
          // find the country in the json file
          const countryData = countries.find(c => c.code === country.code);
          if(!countryData) {
            console.log(`Country "${country.name}" not found in the json file!`)
            continue;
          }
          // create the country
          await Country.create({
            name: country.name,
            code: country.code,
            emoji: countryData.emoji,
            unicode: countryData.unicode,
            image: country.image,
          });
          console.log(`Country "${country.name}" addded!`)
        }
      }
      
  
      await Migration.create({ name: migrationName, timestamp: Date.now() })
  
      // End of migration
      console.log(`*- Migration ${migrationName} finished`)
    } catch (error) {
      console.error(`*- Error running migration ${migrationName}!`)
      throw error
    }
  }
}
