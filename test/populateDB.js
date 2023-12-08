// This file is to populate the database with dummy data for testing purposes.
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/user');
const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Country = require('../models/country');
const { faker } = require('@faker-js/faker');


let countries = [];
let adminUsers = [];
let authorUsers = [];
let users = [];
let projects = [];

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

async function pickRandom(arr){
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

async function createUsers() {
  try {
    // create 3 users with role admin
    for(let i = 0; i < 3; i++) {
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
    }
    // create 3 users with role author
    for(let i = 0; i < 3; i++) {
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
    }
    // create 5 users with role 'user'
    for(let i = 0; i < 5; i++) {
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
    }
    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createProjects(){
  try {
    // create 15 projects
    for(let i = 0; i < 15; i++) {
      const project = new Project({
        author: (await pickRandom(authorUsers))._id,
        title_es: faker.lorem.sentence(5),
        title_pt: faker.lorem.sentence(5),
        path: faker.lorem.slug(3),
        version: 1,
        about_es: faker.lorem.sentence(20),
        about_pt: faker.lorem.sentence(20),
        hidden: false,
        // articles: [],
        // versions: []
        stage: 'AR',
        closedAt: null,
        publishedAt: new Date(),
      });
      await project.save();
      // create 8 comments for the project
      for(let j = 0; j < 8; j++) {
        const comment = new Comment({
          user: (await pickRandom(users))._id,
          project: project._id,
          text: faker.lorem.sentence(10),
          createdInVersion: project.version,
        });
        await comment.save();
        // now we need to create 5 replies for each comment
        const replies = []
        for(let j = 0; j < 5; j++) {
          const reply = new Reply({
            user: (await pickRandom(users))._id,
            comment: comment._id,
            text: faker.lorem.sentence(10),
          });
          await reply.save();
          replies.push(reply);
        }
        // submit the array of replies ids to the comment
        comment.replies = replies.map(reply => reply._id);
        // save it
        await comment.save();
      }
      // now we need to create 5 articles for each project
      const articles = []
      for(let j = 0; j < 5; j++) {
        const article = new Article({
          project: project._id,
          text_es: faker.lorem.paragraph(2),
          text_pt: faker.lorem.paragraph(2),
          position: j + 1,
        });
        await article.save();
        articles.push(article);
        // now we need to create 5 comments for the article
        for(let j = 0; j < 5; j++) {
          const comment = new Comment({
            user: (await pickRandom(users))._id,
            project: project._id,
            article: article._id,
            text: faker.lorem.sentence(10),
            createdInVersion: project.version,
          });
          await comment.save();
          // now we need to create 5 replies for each comment
          const replies = []
          for(let j = 0; j < 5; j++) {
            const reply = new Reply({
              user: (await pickRandom(users))._id,
              comment: comment._id,
              text: faker.lorem.sentence(10),
            });
            await reply.save();
            replies.push(reply);
          }
          // submit the array of replies ids to the comment
          comment.replies = replies.map(reply => reply._id);
          // save it
          await comment.save();
        }
      }
      // submit the array of articles ids to the project
      project.articles = articles.map(article => article._id);
      // save it
      await project.save();
      projects.push(project);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Populating database...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database');
    await createUsers();
    console.log('Users created');
    await createProjects();
    console.log('Projects created');
    console.log('Database populated');

    process.exit(0);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

main();
