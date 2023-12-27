
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


