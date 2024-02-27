// const mongoose = require('mongoose')
const Migration = require('../models/migration')
const User = require('../models/user')
// Add the models that the migration will use


// Define the migration
module.exports = {
  async run () {
    // ==============================================
    // ========= START OF MIGRATION CODE ============
    // Check if the migration has already been applied
    const migrationName = 'new-user-param-participation-in-assemblies' // Replace with your migration name
    const existingMigration = await Migration.findOne({ name: migrationName })

    if (existingMigration) {
      // Already applied, skip
      return
    }

    console.log(`* Running migration ${migrationName}`)
    // ==============================================
    // Write your migration down here 

    // Get all the users who doesnt have the new param participatedInAssembly
    const users = await User.find({ participatedInAssembly: { $exists: false } })

    // Add the new param to all the users, set it to false
    for (const user of users) {
      user.participatedInAssembly = false
      await user.save()
    }

    await Migration.create({ name: migrationName, timestamp: Date.now() })

    // End of migration
    console.log(`*- Migration ${migrationName} finished`)
  }
}
