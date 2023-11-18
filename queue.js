require('dotenv').config();
const agenda = require('./services/agenda');
// job processor



agenda.define('test', async job => {
  try {
    const { message } = job.attrs.data;
    console.log(message);
  } catch (error) {
    console.error(error);
  }
});

// start agenda
agenda.start();

