const mongoose = require('mongoose');
const User = require('./user');
const Article = require('./article');
const Comment = require('./comment');
const Like = require('./like');
const Reply = require('./reply');

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

const VersionStatsSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    default: 1
  },
  likes: { // how many likes the project had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  dislikes: { // how many dislikes the project had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  comments: { // how many comments the project had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsLikes: { // how many likes the comments had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsDislikes: { // how many dislikes the comments had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsReplies: { // how many project comment replies the project had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsRepliesLikes: { // how many likes the project comments replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsRepliesDislikes: { // how many dislikes the project comment replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsCreatedInVersion: { // how many project comments were created in this version
    type: Number,
    required: true,
    default: 0
  },
  commentsHighlightedInVersion: { // how many project comments were highlighted when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsResolvedInVersion: { // how many project comments were resolved when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsersWhoInteracted: { // how many unique users interacted with the project when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsersWhoInteractedPerCountry: { // how many unique users interacted with the project when this version ended
    type: Map,
    of: Number,
    required: true,
    default: {}
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
  versionsStats: [VersionStatsSchema],
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

// STATS METHODS

ProjectSchema.methods.getLikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: null, reply: null, type: 'like'});
}

ProjectSchema.methods.getDislikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: null, reply: null, type: 'dislike'});
}

ProjectSchema.methods.getCommentsCount = async function() {
  return await Comment.countDocuments({project: this._id, article: null});
}

ProjectSchema.methods.getCommentsLikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: {$ne: null}, reply: null, type: 'like'});
}

ProjectSchema.methods.getCommentsDislikesCount = async function() {
  return await Like.countDocuments({project: this._id, article: null, comment: {$ne: null}, reply: null, type: 'dislike'});
}

ProjectSchema.methods.getCommentsRepliesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this._id, article: null});
  const commentIds = comments.map(comment => comment._id);
  // get the replies count
  return await Reply.countDocuments({comment: {$in: commentIds}});
}

ProjectSchema.methods.getCommentsRepliesLikesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this._id, article: null});
  const commentIds = comments.map(comment => comment._id);
  // get the replies IDs
  const replies = await Reply.find({comment: {$in: commentIds}});
  const replyIds = replies.map(reply => reply._id);
  // get the likes count
  return await Like.countDocuments({project: this._id, article: null, comment: {$ne: null}, reply: {$in: replyIds}, type: 'like'});
}

ProjectSchema.methods.getCommentsRepliesDislikesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this._id, article: null});
  const commentIds = comments.map(comment => comment._id);
  // get the replies IDs
  const replies = await Reply.find({comment: {$in: commentIds}});
  const replyIds = replies.map(reply => reply._id);
  // get the likes count
  return await Like.countDocuments({project: this._id, article: null, comment: {$ne: null}, reply: {$in: replyIds}, type: 'dislike'});
}

ProjectSchema.methods.getCommentsCreatedInVersionCount = async function() {
  return await Comment.countDocuments({project: this._id, article: null, createdInVersion: this.version });
}

ProjectSchema.methods.getCommentsHighlightedInVersionCount = async function() {
  return await Comment.countDocuments({project: this._id, article: null, highlightedInVersion: this.version });
}

ProjectSchema.methods.getCommentsResolvedInVersionCount = async function() {
  return await Comment.countDocuments({project: this._id, article: null, resolvedInVersion: this.version });
}

ProjectSchema.methods.getUniqueUsersWhoInteracted = async function() {
  // project comments (not articles)
  const projectComments = await Comment.find({project: this._id, article: null});
  const projectCommentIds = projectComments.map(comment => comment._id);
  const usersWhoCommented = projectComments.map(comment => comment.user.toString());
  // project comment replies (not articles)
  const projectCommentReplies = await Reply.find({comment: {$in: projectCommentIds}});
  const projectCommentReplyIds = projectCommentReplies.map(reply => reply._id);
  const usersWhoRepliedProjectComments = projectCommentReplies.map(reply => reply.user.toString());
  // project likes (not articles)
  const projectLikes = await Like.find({project: this._id, article: null, comment: null, reply: null, type: 'like'});
  const usersWhoLikedProject = projectLikes.map(like => like.user.toString());
  // project dislikes (not articles)
  const projectDislikes = await Like.find({project: this._id, article: null , comment: null, reply: null, type: 'dislike'});
  const usersWhoDislikedProject = projectDislikes.map(dislike => dislike.user.toString());

  const projectCommentsLikes = await Like.find({project: this._id, article: null, comment: {$in: projectCommentIds}, reply: null, type: 'like'});
  const usersWhoLikedProjectComments = projectCommentsLikes.map(like => like.user.toString());

  const projectCommentsDislikes = await Like.find({project: this._id, article: null, comment: {$in: projectCommentIds}, reply: null, type: 'dislike'});
  const usersWhoDislikedProjectComments = projectCommentsDislikes.map(dislike => dislike.user.toString());

  const projectCommentsRepliesLikes = await Like.find({project: this._id, article: null, comment: {$in: projectCommentIds}, reply: {$in: projectCommentReplyIds}, type: 'like'});
  const usersWhoLikedProjectCommentsReplies = projectCommentsRepliesLikes.map(like => like.user.toString());

  const projectCommentsRepliesDislikes = await Like.find({project: this._id, article: null, comment: {$in: projectCommentIds}, reply: {$in: projectCommentReplyIds}, type: 'dislike'});
  const usersWhoDislikedProjectCommentsReplies = projectCommentsRepliesDislikes.map(dislike => dislike.user.toString());


  const uniqueUsersIds = []
  usersWhoCommented.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoRepliedProjectComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedProject.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedProject.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedProjectComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedProjectComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedProjectCommentsReplies.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedProjectCommentsReplies.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });

  const uniqueUsersWhoInteracted = await User.find({_id: {$in: uniqueUsersIds}}).populate('country');

  // group by country code
  const uniqueUsersWhoInteractedPerCountry = {};
  uniqueUsersWhoInteracted.forEach(user => {
    if(!uniqueUsersWhoInteractedPerCountry[user.country.code]) {
      uniqueUsersWhoInteractedPerCountry[user.country.code] = 1;
    } else {
      uniqueUsersWhoInteractedPerCountry[user.country.code] += 1;
    }
  });

  return {
    count: uniqueUsersWhoInteracted.length,
    countPerCountry: uniqueUsersWhoInteractedPerCountry
  };
}

ProjectSchema.methods.getArticleCommentsCount = async function() {
  const articles = await Article.find({project: this._id, _id: {$in: this.articles}});
  const articleIds = articles.map(article => article._id);
  return await Comment.countDocuments({
    project: this._id,
    article: {$in: articleIds}, 
    highlightedInVersion: {$in: [0, this.version]},
    resolvedInVersion: {$in: [0, this.version]}
  });
}

module.exports = mongoose.model('Project', ProjectSchema);
