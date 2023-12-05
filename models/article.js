
const mongoose = require('mongoose');

const ArticleVersionSchema = new mongoose.Schema({
  body_es: {
    type: String,
    required: true
  },
  body_pt: {
    type: String,
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
  body_es: {
    type: String,
    required: true
  },
  body_pt: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  history: [ArticleVersionSchema]
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


exports.Article = mongoose.model('Article', ArticleSchema);


