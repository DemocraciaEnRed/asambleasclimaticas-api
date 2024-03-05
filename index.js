require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path");
const database = require('./services/database');
const migrations = require('./services/migrations');
const agenda = require('./services/agenda')
const logger = require('./services/logger');
const i18n = require('./services/i18n');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin


// Set up timezone argentina for dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

// Setting up port
let PORT = process.env.PORT || 3000;

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

let appOrigins = ['http://localhost:4000']
if(process.env.APP_URL){
	appOrigins = process.env.APP_URL.split(',')
}

app.use(cors({
	origin: appOrigins,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	// allow content disposition for file download
	exposedHeaders: ['Content-Disposition'],
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up i18n
app.use(i18n.init);

//=== 2 - SET UP DATABASE & MIGRATIONS
database.connect().then(() => {
	// after successful connection to database, run any migration available
	migrations.start();
})

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
require('./routes/index')(app);

//=== 5 - START SERVER
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT + '/'));