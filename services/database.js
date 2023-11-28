
require('dotenv').config();
const mongoose = require('mongoose');

// //Configure mongoose's promise to global promise
// mongoose.promise = global.Promise;

// //mongoose.connect(connUri, { useNewUrlParser: true , useCreateIndex: true});
// mongoose.connect(connUri, {});

// const connection = mongoose.connection;
// connection.once('open', () => console.log('MongoDB --  database connection established successfully!'));
// connection.on('error', (err) => {
//     console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
//     process.exit();
// });

// Set Mongoose's default Promise library to the native Promise
mongoose.Promise = global.Promise;

exports.connect = async () => {
  try {
    const connUri = process.env.MONGODB_URL;
    console.log('MongoDB connecting...');
    await mongoose.connect(connUri, {});
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process upon connection error
  }
};
