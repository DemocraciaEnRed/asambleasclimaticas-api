require('dotenv').config();
const agenda = require('./services/agenda');
const jobs = require('./jobs/index');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
const fs = require('fs');
const path = require('path');

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

// ---------------------------------------------------

async function graceful() {
	await agenda.stop();
  // write a file in the root of the directory that saves 1 if the app is not alive
  fs.writeFileSync(path.join(__dirname, 'alive'), '1');
	process.exit(0);
}

// every 5 secs, write a file in the root of the directory that saves 0 if the app is alive
fs.writeFileSync(path.join(__dirname, 'alive'), '0');
setInterval(() => {
  fs.writeFileSync(path.join(__dirname, 'alive'), '0');
}, 5 * 1000);

// on process kill of some reason, stop agenda
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
process.on('exit', graceful);
process.on('beforeExit', graceful);
process.on('uncaughtException', graceful);