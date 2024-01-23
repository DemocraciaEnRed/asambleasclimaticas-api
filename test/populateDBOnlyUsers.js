// This file is to populate the database with dummy data for testing purposes.
require('dotenv').config();

const mongoose = require('mongoose');
const axios = require('axios');
const Country = require('../models/country');
const User = require('../models/user');
const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const { faker } = require('@faker-js/faker');
const debug = require('debug')('app:test:populateDB');


let countries = [];
let adminUsers = [];
let authorUsers = [];
let users = [];

async function pickRandomLanguage() {
  const languages = ['es', 'pt'];
  const randomIndex = Math.floor(Math.random() * languages.length);
  return languages[randomIndex];
}

async function pickRancomCountry() {
  if(countries.length === 0) {
    countries = await Country.find({});
  }
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

async function createUsers() {
  try {
    // create 5 users with role admin
    for(let i = 0; i < 5; i++) {
      const user = new User({
        email: faker.internet.email().toLowerCase(),
        password: '12345678',
        name: faker.person.fullName(),
        country: (await pickRancomCountry())._id,
        lang: await pickRandomLanguage(),
        bio: faker.lorem.sentence(20),
        role: 'admin',
        isVerified: true
      });
      await user.save();
      adminUsers.push(user);
      debug(`* Admin user created: ${user.email}`);
    }
    // create 10 users with role author
    for(let i = 0; i < 10; i++) {
      const user = new User({
        email: faker.internet.email().toLowerCase(),
        password: '12345678',
        name: faker.person.fullName(),
        country: (await pickRancomCountry())._id,
        lang: await pickRandomLanguage(),
        bio: faker.lorem.sentence(20),
        role: 'author',
        isVerified: true
      });
      await user.save();
      authorUsers.push(user);
      debug(`* Author user created: ${user.email}`);
    }
    // create 20 users with role 'user'
    for(let i = 0; i < 20; i++) {
      const user = new User({
        email: faker.internet.email().toLowerCase(),
        password: '12345678',
        name: faker.person.fullName(),
        country: (await pickRancomCountry())._id,
        lang: await pickRandomLanguage(),
        bio: faker.lorem.sentence(20),
        role: 'user',
        isVerified: true
      });
      await user.save();
      users.push(user);
      debug(`* User created: ${user.email}`);
    }
    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function cleanDatabase() {
  try {
    const countries = await Country.countDocuments({})
    // check if country has been populated
    if(countries == 0) {
      throw new Error('Countries collection is empty. Please "run npm dev" first to run migrations');
    }
    // Drop User collection
    debug('Prunning users...');
    await User.deleteMany({})
    // Drop Project collection
    debug('Prunning projects...');
    await Project.deleteMany({})
    // Drop Article collection
    debug('Prunning articles...');
    await Article.deleteMany({})
    // Drop Comment collection
    debug('Prunning comments...');
    await Comment.deleteMany({})
    // Drop Reply collection
    debug('Prunning replies...');
    await Reply.deleteMany({})
    // Drop Like collection
    debug('Prunning likes...');
    await Like.deleteMany({})
    // -----------------
    debug('* Database prunned');
  } catch (error) {
    console.error(error);
    throw error;
  }
}


async function main() {
  try {
    debug('Populating database...');
    await mongoose.connect(process.env.MONGODB_URL);
    debug('Connected to database');
    debug('Prunning database...');
    await cleanDatabase();
    debug('Database is empty!');
    debug('----------------------')
    debug('Creating users...')
    await createUsers();
    debug('Users created');
    debug('Database populated only with users');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
