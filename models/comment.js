const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    default: null
  },
  text: {
    type: String,
    required: true
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  }],
  createdInVersion: {
    type: Number,
    default: 0
  },
  highlightedInVersion: {
    type: Number,
    default: 0
  },
  resolvedInVersion: {
    type: Number,
    default: 0
  },
}, {timestamps: true});

/**
 * Retrieves the number of likes for the comment.
 * @param {function} cb - The callback function to handle the result.
 * @returns {Promise<number>} The number of likes for the comment.
 */
CommentSchema.methods.getLikesCount = function(cb) {
  return mongoose.model('Like').count({comment: this._id, type: 'like'}, cb);
}

/**
 * Retrieves the number of dislikes for the comment.
 * @param {function} cb - The callback function to handle the result.
 * @returns {Promise<number>} The number of dislikes for the comment.
 */
CommentSchema.methods.getDislikesCount = function(cb) {
  return mongoose.model('Like').count({comment: this._id, type: 'dislike'}, cb);
}

module.exports = mongoose.model('Comment', CommentSchema);
