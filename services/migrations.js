
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

exports.start = async () => {
  try {
    console.log('Migrations service started...')
    await runMigrations()
    console.log('Migrations service finished')
  } catch (err) {
    console.error(err)
    console.warn('Error running migrations')
  }
}

async function runMigrations () {
  const migrationDir = path.join(__dirname, '../migrations')
  const migrations = await promisify(fs.readdir)(migrationDir)

  try {
    for (let migration of migrations) {
      const migrationPath = path.join(migrationDir, migration)
      const migrationModule = require(migrationPath)
      await migrationModule.run()
    }
  } catch (err) {
    throw err
  }
}