require('dotenv').config();
const agenda = require('./services/agenda');
const jobs = require('./jobs/index');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin

// Set up timezone argentina for dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

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

