
const mongoose = require('mongoose');

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
  return mongoose.model('Like').count({article: this._id, type: 'like'}, cb);
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
  return mongoose.model('Like').count({article: this._id, type: 'dislike'}, cb);
}

// TODO get the comments count
// TODO get count of highlithed comments
// TODO get count of comments with replies


module.exports = mongoose.model('Article', ArticleSchema);


