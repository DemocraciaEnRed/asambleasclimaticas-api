
const mongoose = require('mongoose');
const Like = require('./like');
const Comment = require('./comment');
const Reply = require('./reply');
const User = require('./user');

const ArticleVersionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    default: 1
  },
  text_es: {
    type: String,
    required: true
  },
  text_pt: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
}, {timestamps: true});

const ArticleVersionStatsSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    default: 1
  },
  likes: { // how many likes the article had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  dislikes: { // how many dislikes the article had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  comments: { // how many comments the article had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsLikes: { // how many likes the article comments had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsDislikes: { // how many dislikes the comments had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsReplies: { // how many article comment replies the project had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsRepliesLikes: { // how many likes the article comments replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsRepliesDislikes: { // how many dislikes the article comment replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsCreatedInVersion: { // how many article comments were created in this version
    type: Number,
    required: true,
    default: 0
  },
  commentsHighlightedInVersion: { // how many article comments were highlighted when this version ended
    type: Number,
    required: true,
    default: 0
  },
  commentsResolvedInVersion: { // how many article comments were resolved when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsersWhoInteracted: { // how many unique users interacted with the article when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsersWhoInteractedPerCountry: { // how many unique users interacted with the project when this version ended
    type: Map,
    of: Number,
    required: true,
    default: {}
  }
}, {timestamps: true});

const ArticleSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  text_es: {
    type: String,
    required: true
  },
  text_pt: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  notInteractive:{
    type: Boolean,
    default:false
  },
  versions: [ArticleVersionSchema],
  versionsStats: [ArticleVersionStatsSchema],
}, {timestamps: true});

/**
 * A method to get the count of likes for the article.
 * @function getLikesCount
 * @param {function} cb - The callback function to handle the result.
 * @returns {Promise<number>} The count of likes for the article.
 * @memberof ArticleSchema
 * @instance
 */

ArticleSchema.methods.getLikesCount = function(cb) {
  return Like.countDocuments({article: this._id, type: 'like'}, cb);
}

/**
 * A method to get the count of dislikes for the article.
 * @function getDislikesCount
 * @param {function} cb - The callback function to handle the result.
 * @returns {Promise<number>} The count of dislikes for the article.
 * @memberof ArticleSchema
 * @instance
 */

ArticleSchema.methods.getDislikesCount = function(cb) {
  return Like.countDocuments({article: this._id, type: 'dislike'}, cb);
}

// get the comments count

ArticleSchema.methods.getCommentsCount = async function() {
  return await comment.countDocuments({project: this.project._id, article: this._id});
}

// Get if a user has liked or disliked an article
ArticleSchema.methods.getIfLikedOrDislikedByUser = async function(userId) {
  if(!userId) {
    return {
      liked: false,
      disliked: false
    }
  }
  const likeStatus = await Like.findOne({project: this.project, article: this._id, comment: null, reply: null, user: userId});

  return {
    liked: likeStatus && likeStatus.type === 'like' || false,
    disliked: likeStatus && likeStatus.type === 'dislike' || false
  }
}

// TODO get count of highlithed comments
// TODO get count of comments with replies



// STATS METHODS

ArticleSchema.methods.getLikesCount = async function() {
  return await Like.countDocuments({project: this.project, article: this._id, comment: null, reply: null, type: 'like'});
}

ArticleSchema.methods.getDislikesCount = async function() {
  return await Like.countDocuments({project: this.project, article: this._id, comment: null, reply: null, type: 'dislike'});
}

ArticleSchema.methods.getCommentsCount = async function() {
  return await Comment.countDocuments({project: this.project, article: this._id});
}

ArticleSchema.methods.getCommentsLikesCount = async function() {
  return await Like.countDocuments({project: this.project, article: this._id, comment: {$ne: null}, reply: null, type: 'like'});
}

ArticleSchema.methods.getCommentsDislikesCount = async function() {
  return await Like.countDocuments({project: this.project, article: this._id, comment: {$ne: null}, reply: null, type: 'dislike'});
}

ArticleSchema.methods.getCommentsRepliesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this.project, article: this._id});
  const commentIds = comments.map(comment => comment._id);
  // get the replies count
  return await Reply.countDocuments({comment: {$in: commentIds}});
}

ArticleSchema.methods.getCommentsRepliesLikesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this.project, article: this._id});
  const commentIds = comments.map(comment => comment._id);
  // get the replies IDs
  const replies = await Reply.find({comment: {$in: commentIds}});
  const replyIds = replies.map(reply => reply._id);
  // get the likes count
  return await Like.countDocuments({project: this.project, article: this._id, comment: {$ne: null}, reply: {$in: replyIds}, type: 'like'});
}

ArticleSchema.methods.getCommentsRepliesDislikesCount = async function() {
  // get the comments IDs
  const comments = await Comment.find({project: this.project, article: this._id});
  const commentIds = comments.map(comment => comment._id);
  // get the replies IDs
  const replies = await Reply.find({comment: {$in: commentIds}});
  const replyIds = replies.map(reply => reply._id);
  // get the likes count
  return await Like.countDocuments({project: this.project, article: this._id, comment: {$ne: null}, reply: {$in: replyIds}, type: 'dislike'});
}

ArticleSchema.methods.getCommentsCreatedInVersionCount = async function(version) {
  return await Comment.countDocuments({project: this.project, article: this._id, createdInVersion: version });
}

ArticleSchema.methods.getCommentsHighlightedInVersionCount = async function(version) {
  return await Comment.countDocuments({project: this.project, article: this._id, highlightedInVersion: version });
}

ArticleSchema.methods.getCommentsResolvedInVersionCount = async function(version) {
  return await Comment.countDocuments({project: this.project, article: this._id, resolvedInVersion: version });
}

ArticleSchema.methods.getUniqueUsersWhoInteracted = async function() {
  // article comments
  const articleComments = await Comment.find({project: this.project, article: this._id});
  const articleCommentIds = articleComments.map(comment => comment._id);
  const usersWhoCommented = articleComments.map(comment => comment.user.toString());
  // article comment replies
  const articleCommentReplies = await Reply.find({comment: {$in: articleCommentIds}});
  const articleCommentReplyIds = articleCommentReplies.map(reply => reply._id);
  const usersWhoRepliedArticleComments = articleCommentReplies.map(reply => reply.user.toString());
  // article likes
  const articleLikes = await Like.find({project: this.project, article: this._id, comment: null, reply: null, type: 'like'});
  const usersWhoLikedArticle = articleLikes.map(like => like.user.toString());
  // article dislikes
  const articleDislikes = await Like.find({project: this.project, article: this._id , comment: null, reply: null, type: 'dislike'});
  const usersWhoDislikedArticle = articleDislikes.map(dislike => dislike.user.toString());

  const articleCommentsLikes = await Like.find({project: this.project, article: this._id, comment: {$in: articleCommentIds}, reply: null, type: 'like'});
  const usersWhoLikedArticleComments = articleCommentsLikes.map(like => like.user.toString());

  const articleCommentsDislikes = await Like.find({project: this.project, article: this._id, comment: {$in: articleCommentIds}, reply: null, type: 'dislike'});
  const usersWhoDislikedArticleComments = articleCommentsDislikes.map(dislike => dislike.user.toString());

  const articleCommentsRepliesLikes = await Like.find({project: this.project, article: this._id, comment: {$in: articleCommentIds}, reply: {$in: articleCommentReplyIds}, type: 'like'});
  const usersWhoLikedArticleCommentsReplies = articleCommentsRepliesLikes.map(like => like.user.toString());

  const articleCommentsRepliesDislikes = await Like.find({project: this.project, article: this._id, comment: {$in: articleCommentIds}, reply: {$in: articleCommentReplyIds}, type: 'dislike'});
  const usersWhoDislikedArticleCommentsReplies = articleCommentsRepliesDislikes.map(dislike => dislike.user.toString());


  const uniqueUsersIds = []
  usersWhoCommented.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoRepliedArticleComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedArticle.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedArticle.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedArticleComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedArticleComments.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoLikedArticleCommentsReplies.forEach(userId => {
    if(!uniqueUsersIds.includes(userId)) uniqueUsersIds.push(userId);
  });
  usersWhoDislikedArticleCommentsReplies.forEach(userId => {
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


module.exports = mongoose.model('Article', ArticleSchema);


