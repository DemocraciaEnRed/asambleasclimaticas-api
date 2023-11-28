require('dotenv').config();
const agenda = require('./services/agenda');
const jobs = require('./jobs/index');
// job processor



agenda.define('test', async job => {
  try {
    const { message } = job.attrs.data;
    console.log(message);
  } catch (error) {
    console.error(error);
  }
});

agenda.define('send-mail', jobs.sendMail)

// start agenda
agenda.start();

