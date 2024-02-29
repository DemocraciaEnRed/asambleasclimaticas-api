// const mongoose = require('mongoose')
const Migration = require('../models/migration')
const mongoose = require('mongoose');

const Project = require('../models/project')
// Add the models that the migration will use


// Define the migration
module.exports = {
  async run () {
    // ==============================================
    // ========= START OF MIGRATION CODE ============
    // Check if the migration has already been applied
    const migrationName = 'new-project-param-author-notes' // Replace with your migration name
    const existingMigration = await Migration.findOne({ name: migrationName })

    if (existingMigration) {
      // Already applied, skip
      return
    }

    console.log(`* Running migration ${migrationName}`)
    // ==============================================
    // Write your migration down here 

    // Add the new field to the project, for current versions of the project
    await mongoose.connection.db.collection('projects').updateMany(
      {
        authorNotes_es: { $exists: false },
        authorNotes_pt: { $exists: false }
      },
      {
        $set: {
          authorNotes_es: null,
          authorNotes_pt: null,
        }
      })
      console.log(`*-- projects added authorNotes_es and authorNotes_pt fields to all versions without them`)
      // Add the new field to the project, for current old of the project
      const projectsWithVersionsWithoutAuthorNotes = await mongoose.connection.db.collection('projects').find(
        { 
          versions: { 
            $elemMatch: {
              authorNotes_pt: { $exists: false },
              authorNotes_es: { $exists: false }
            }
          }
        })
      for await (const project of projectsWithVersionsWithoutAuthorNotes) {
        console.log(`*-- Updating Project ID: ${project._id}`)
        await mongoose.connection.db.collection('projects').updateOne(
          { _id: project._id },
          {
            $set: {
              'versions.$[elem].authorNotes_es': null,
              'versions.$[elem].authorNotes_pt': null
            }
          },
          {
            arrayFilters: [{ 'elem.authorNotes_es': { $exists: false } }]
          }
        )
        console.log(`*-- project.versions of project ID ${project._id} added authorNotes_es and authorNotes_pt fields to all versions without them`)
      }


    await Migration.create({ name: migrationName, timestamp: Date.now() })
   
    // End of migration
    console.log(`*- Migration ${migrationName} finished`)
  }
}
