const Agenda = require("agenda");

const agenda = new Agenda({
  processEvery: '10 seconds',
  lockLimit: 2,  
  // maxConcurrency: 3,
  db: {
    address: process.env.MONGODB_URL,
    collection: 'jobs'
  }
});

agenda.on('ready', () => {
  console.log('Agenda.js is ready!')
})

// agenda.on('start', job => {
//   console.log('Job %s starting', job.attrs.name);
// }) 

// agenda.on('complete', job => {
//   console.log('Job %s finished', job.attrs.name);
// })

// agenda.on('success', job => {
//   console.log('Job %s succeeded', job.attrs.name);
// })

agenda.on('fail', job => {
  console.log('Job %s failed', job.attrs.name);
})

module.exports = agenda;