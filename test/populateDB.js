// This file is to populate the database with dummy data for testing purposes.
require('dotenv').config();

const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/user');
const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const Country = require('../models/country');
const { faker } = require('@faker-js/faker');
const debug = require('debug')('app:test:populateDB');


let countries = [];
let adminUsers = [];
let authorUsers = [];
let users = [];
let projects = [];

async function fetchMarkdownContent() {
  try {
    debug('---- Fetching markdown content...');
    const response = await axios.get('https://jaspervdj.be/lorem-markdownum/markdown.txt?no-code=on&no-inline-markup=on&reference-links=on&no-wrapping=on');
    return response.data;
  } catch (error) {
    // Handle error, e.g., log it or throw a custom error
    console.error('Error fetching markdown content:', error.message);
    throw error;
  }
}

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

function getYoutubeUrl() {
  // flip a coin, if it is heads, return a youtube url
  // if its tails, return null
  const coin = Math.random() >= 0.75;
  if(coin) {
    return 'https://www.youtube.com/watch?v=WZviVJfepDM&list=FL-7kSn8zXKxkdIfrX4VNuow&index=2&ab_channel=Vulf'
  }
  return null;
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
        isVerified: true,
        lastLogin: null
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
        isVerified: true,
        lastLogin: null
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
        isVerified: true,
        lastLogin: null
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

async function getDateIn45Days() {
  const date = new Date();
  date.setDate(date.getDate() + 45);
  return date;
}


async function createProjects(){
  try {
    // create 15 projects
    for(let i = 0; i < 4; i++) {
      const project = new Project({
        author: (await pickRandom(authorUsers))._id,
        title_es: faker.lorem.sentence(5),
        title_pt: faker.lorem.sentence(5),
        slug: faker.lorem.slug(3),
        coverUrl: faker.image.url(),
        youtubeUrl: getYoutubeUrl(),
        version: 1,
        shortAbout_es: faker.lorem.sentences(2),
        shortAbout_pt: faker.lorem.sentences(2),
        about_es: await fetchMarkdownContent(),
        about_pt: await fetchMarkdownContent(),
        hidden: false,
        // articles: [],
        // versions: []
        stage: 'BR',
        closedAt: await getDateIn45Days(),
        publishedAt: new Date(),
      });
      await project.save();
      debug(`* Project created: ${project._id}`);
      // create [8,20] comments for the project
      const commentsCount = 8 + Math.floor(Math.random() * 12);
      for(let j = 0; j < commentsCount; j++) {
        const comment = new Comment({
          user: (await pickRandom(users))._id,
          project: project._id,
          text: faker.lorem.sentences({min: 3, max: 12}),
          createdInVersion: project.version,
        });
        await comment.save();
        debug(`** Comment ${comment._id} created for project ${project._id}`);
        // now we need to create [2,20] replies for each comment
        const repliesCount = 2 + Math.floor(Math.random() * 18);
        const replies = []
        for(let j = 0; j < repliesCount; j++) {
          const reply = new Reply({
            user: (await pickRandom(users))._id,
            comment: comment._id,
            text: faker.lorem.sentences({min: 3, max: 8}),
          });
          await reply.save();
          replies.push(reply);
          debug(`*** Reply ${reply._id} created for comment ${comment._id}`);
        }
        // submit the array of replies ids to the comment
        comment.replies = replies.map(reply => reply._id);
        // save it
        await comment.save();
        debug(`** Comment ${comment._id} of project ${project._id} updated with replies: ${repliesCount}`);
      }
      // now we need to create [2,6] articles for each project
      const articleCount = 2 + Math.floor(Math.random() * 5);
      const articles = []
      for(let j = 0; j < articleCount; j++) {
        const article = new Article({
          project: project._id,
          // text_es: faker.lorem.paragraph(3),
          text_es: await fetchMarkdownContent(),
          // text_pt: faker.lorem.paragraph(3),
          text_pt: await fetchMarkdownContent(),
          position: j + 1,
        });
        await article.save();
        articles.push(article);
        debug(`** Article ${article._id} created for project ${project._id}`);
        // now we need to create [13,30] comments for each article
        const commentsCount = 13 + Math.floor(Math.random() * 17);
        for(let j = 0; j < commentsCount; j++) {
          const comment = new Comment({
            user: (await pickRandom(users))._id,
            project: project._id,
            article: article._id,
            text: faker.lorem.sentences({min: 3, max: 12}),
            createdInVersion: project.version,
          });
          await comment.save();
          debug(`*** Comment ${comment._id} created for article ${article._id}`);
          // now we need to create [20,40] replies for each comment
          const replies = []
          const repliesCount = 20 + Math.floor(Math.random() * 20);
          for(let j = 0; j < repliesCount; j++) {
            const reply = new Reply({
              user: (await pickRandom(users))._id,
              comment: comment._id,
              text: faker.lorem.sentences({min: 3, max: 8}),
            });
            await reply.save();
            replies.push(reply);
            debug(`**** Reply ${reply._id} created for comment ${comment._id}`);
          }
          // submit the array of replies ids to the comment
          comment.replies = replies.map(reply => reply._id);
          // save it
          await comment.save();
          debug(`*** Comment ${comment._id} of article ${article._id} updated with replies: ${repliesCount}`);
        }
      }
      // submit the array of articles ids to the project
      project.articles = articles.map(article => article._id);
      await project.save();
      debug(`* Project ${project._id} updated with articles: ${articleCount}`);
      // now lets create 25 events
      const events = []
      for(let j = 0; j < 25; j++) {
        const event = {
          title_es: faker.lorem.sentence(5),
          title_pt: faker.lorem.sentence(5),
          text_es: faker.lorem.sentences({min: 20, max: 40}),
          text_pt: faker.lorem.sentences({min: 20, max: 40}),
          date: faker.date.recent({days: 30 - j}),
        }
        events.push(event);
      }
      // save it
      project.events = events;
      await project.save();
      debug(`* Project ${project._id} updated with events: 30`);
      projects.push(project);
    }
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

async function randomUsersLikingProjects(interactionsCount) {
  try {
    debug(`---- Creating ${interactionsCount} random likes...`);
    for(let i = 0; i < interactionsCount; i++) {
      const user = await pickRandom(users);
      const project = await pickRandom(projects);
      // check if the like already exists
      const like = await Like.findOne({
        user: user._id,
        project: project._id,
        article: null,
        comment: null,
        reply: null,
      });
      if(like) {
        debug(`* Like ${like._id} already exists for project ${project._id} by user ${user._id}`);
        continue;
      }
      const newLike = await new Like({
        user: user._id,
        project: project._id,
        article: null,
        comment: null,
        reply: null,
        type: Math.random() >= 0.5 ? 'like' : 'dislike',
      });
      await newLike.save();
      debug(`* Like ${newLike._id} created for project ${project._id} by user ${user._id}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function randomUsersLikingArticleProjects(interactionsCount) {
  try {
    debug(`---- Creating ${interactionsCount} random likes...`);
    for(let i = 0; i < interactionsCount; i++) {
      const user = await pickRandom(users);
      const project = await pickRandom(projects);
      const article = await pickRandom(project.articles); // Object Id
      // check if the like already exists
      const like = await Like.findOne({
        user: user._id,
        project: project._id,
        article: article,
        comment: null,
        reply: null,
      });
      if(like) {
        debug(`* Like ${like._id} already exists for article ${article._id} of project ${project._id} by user ${user._id}`);
        continue;
      }
      const newLike = await new Like({
        user: user._id,
        project: project._id,
        article: article,
        comment: null,
        reply: null,
        type: Math.random() >= 0.5 ? 'like' : 'dislike',
      });
      await newLike.save();
      debug(`* Like ${newLike._id} created for article ${article} of project ${project._id} by user ${user._id}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function randomUsersLikingComments(interactionsCount) {
  try {
    debug(`---- Creating ${interactionsCount} random likes...`);
    for(let i = 0; i < interactionsCount; i++) {
      const user = await pickRandom(users);
      const project = await pickRandom(projects);
      const projectComments = await Comment.find({project: project._id});
      const comment = await pickRandom(projectComments);
      // check if the like already exists
      const like = await Like.findOne({
        user: user._id,
        project: project._id,
        article: null,
        comment: comment._id,
        reply: null,
      });
      if(like) {
        debug(`* Like ${like._id} already exists for comment ${comment._id} of project ${project._id} by user ${user._id}`);
        continue;
      }

      const newLike = await new Like({
        user: user._id,
        project: project._id,
        article: null,
        comment: comment._id,
        reply: null,
        type: Math.random() >= 0.5 ? 'like' : 'dislike',
      });
      await newLike.save();
      debug(`* Like ${newLike._id} created for comment ${comment._id} of project ${project._id} by user ${user._id}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function randomUsersLikingReplies(interactionsCount) {
  try {
    debug(`---- Creating ${interactionsCount} random likes...`);
    for(let i = 0; i < interactionsCount; i++) {
      const user = await pickRandom(users);
      const project = await pickRandom(projects);
      const projectComments = await Comment.find({project: project._id});
      const comment = await pickRandom(projectComments);
      const commentReplies = await Reply.find({comment: comment._id});
      const reply = await pickRandom(commentReplies);
      // check if the like already exists
      const like = await Like.findOne({
        user: user._id,
        project: project._id,
        article: null,
        comment: comment._id,
        reply: reply._id,
      });
      if(like) {
        debug(`* Like ${like._id} already exists for reply ${reply._id} of comment ${comment._id} of project ${project._id} by user ${user._id}`);
        continue;
      }
      const newLike = await new Like({
        user: user._id,
        project: project._id,
        article: null,
        comment: comment._id,
        reply: reply._id,
        type: Math.random() >= 0.5 ? 'like' : 'dislike',
      });
      await newLike.save();
      debug(`* Like ${newLike._id} created for reply ${reply._id} of comment ${comment._id} of project ${project._id} by user ${user._id}`);
    }
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
    await createProjects();
    debug('Projects created');
    await randomUsersLikingProjects(400)
    await randomUsersLikingArticleProjects(400)
    await randomUsersLikingComments(400)
    await randomUsersLikingReplies(400)
    debug('Project Likes created');
    debug('Database populated');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
