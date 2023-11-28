// const mongoose = require('mongoose')
const Migration = require('../models/migration')
// Add the models that the migration will use


// Define the migration
module.exports = {
  async run () {
    // ==============================================
    // ========= START OF MIGRATION CODE ============
    // Check if the migration has already been applied
    const migrationName = 'migration-test' // Replace with your migration name
    const existingMigration = await Migration.findOne({ name: migrationName })

    if (existingMigration) {
      // Already applied, skip
      return
    }

    console.log(`* Running migration ${migrationName}`)
    // ==============================================
    // Write your migration down here 
    

    await Migration.create({ name: migrationName, timestamp: Date.now() })

    // End of migration
    console.log(`*- Migration ${migrationName} finished`)
  }
}
