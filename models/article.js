
const mongoose = require('mongoose');
const Like = require('./like');
const comment = require('./comment');

const ArticleVersionSchema = new mongoose.Schema({
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
  replies: { // how many replies the article had when this version ended
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
  repliesLikes: { // how many likes the replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  repliesDislikes: { // how many dislikes the replies had when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsers: { // how many unique users interacted with the article when this version ended
    type: Number,
    required: true,
    default: 0
  },
  highlightedComments: { // how many comments were highlighted when this version ended
    type: Number,
    required: true,
    default: 0
  },
  resolvedComments: { // how many comments were resolved when this version ended
    type: Number,
    required: true,
    default: 0
  },
  uniqueUsersPerCountry: { // how many unique users per country interacted with the article when this version ended
    type: Map,
    of: Number,
    required: true,
    default: {}
  },
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
  versions: [ArticleVersionSchema]
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


module.exports = mongoose.model('Article', ArticleSchema);


