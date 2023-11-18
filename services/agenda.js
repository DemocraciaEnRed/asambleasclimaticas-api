const Agenda = require("agenda");

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URL,
    collection: 'jobs'
  }
});

agenda.on('ready', () => {
  console.log('Agenda.js is ready!')
})

module.exports = agenda;