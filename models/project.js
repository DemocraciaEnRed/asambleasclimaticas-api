const mongoose = require('mongoose');
const User = require('./user');
const Article = require('./article');
const Like = require('./like');

const VersionSchema = new mongoose.Schema({
  about_es: {
    type: String,
    required: true
  },
  about_pt: {
    type: String,
    required: true
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  version: {
    type: Number,
    required: true,
    default: 1
  },
}, {timestamps: true});

const EventsSchema = new mongoose.Schema({
  title_es: {
    type: String,
    required: true
  },
  title_pt: {
    type: String,
    required: true
  },
  text_es: {
    type: String,
    required: true
  },
  text_pt: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
}, {timestamps: true});

const ProjectSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title_es: {
    type: String,
    required: true
  },
  title_pt: {
    type: String,
    required: true
  },
  path: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  about_es: {
    type: String,
    required: true
  },
  about_pt: {
    type: String,
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: true // new projects are hidden by default
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  versions: [VersionSchema],
  events: [EventsSchema],
  // ====================================
  // Specific to Asambleas Climaticas
  stage: {
    type: String,
    required: true,
    default: null
  },
  // ====================================
  closedAt: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
}, {timestamps: true});

ProjectSchema.virtual('published').get(function() {
  return this.publishedAt !== undefined;
});

ProjectSchema.virtual('closed').get(function() {
  // if now is after endDate, project is closed
  if(this.closedAt === undefined) return false; // To check...
  return Date.now() > this.endDate;
});

ProjectSchema.virtual('versionsCount').get(function() {
  return this.versions.length + 1;
})

ProjectSchema.virtual('eventsCount').get(function() {
  return this.events.length;
})

ProjectSchema.virtual('articlesCount').get(function() {
  return this.articles.length;
})

ProjectSchema.methods.getLikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: null, reply: null, type: 'like'});
}

ProjectSchema.methods.getDislikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: null, reply: null, type: 'dislike'});
}

// get author
ProjectSchema.methods.getAuthor = async function() {
  return await User.findById(this.author);
}

module.exports = mongoose.model('Project', ProjectSchema);
