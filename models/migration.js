const mongoose = require('mongoose')

const MigrationSchema = new mongoose.Schema({
  name: String,
  timestamp: Date
})

// Expose 'MigrationSchema' model
module.exports = mongoose.model('Migration', MigrationSchema)
