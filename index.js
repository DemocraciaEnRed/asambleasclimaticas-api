require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path");

// Setting up port
const connUri = process.env.MONGODB_URL;
let PORT = process.env.PORT || 3000;

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//=== 2 - SET UP DATABASE
//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//mongoose.connect(connUri, { useNewUrlParser: true , useCreateIndex: true});
mongoose.connect(connUri, {});

const connection = mongoose.connection;
connection.once('open', () => console.log('MongoDB --  database connection established successfully!'));
connection.on('error', (err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
});

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);


//=== 4 - CONFIGURE ROUTES
//Configure Route
require('./routes/index')(app);


//=== 5 - START SERVER
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT+'/'));