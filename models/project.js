const mongoose = require('mongoose');
const User = require('./user');
const Article = require('./article');
const Comment = require('./comment');
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
  slug: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  coverUrl: {
    type: String,
    required: false,
    default: null
  },
  youtubeUrl: {
    type: String,
    required: false,
    default: null
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

ProjectSchema.methods.getCommentsCount = async function() {
  return await Comment.countDocuments({project: this._id, article: null});
}

ProjectSchema.methods.getArticleCommentsCount = async function() {
  return await Comment.countDocuments({project: this._id, article: {$ne: null}});
}

// get author
ProjectSchema.methods.getAuthor = async function() {
  return await User.findById(this.author);
}

// get if user likes the project
ProjectSchema.methods.getIfLikedOrDislikedByUser = async function(userId) {
  if(!userId) {
    return {
      liked: false,
      disliked: false,
    }
  }
  const likeStatus = await Like.findOne({project: this._id, article: null, comment: null, reply: null, user: userId});
  return {
    liked: likeStatus && likeStatus.type === 'like' || false,
    disliked: likeStatus && likeStatus.type === 'dislike' || false
  }
}

module.exports = mongoose.model('Project', ProjectSchema);
