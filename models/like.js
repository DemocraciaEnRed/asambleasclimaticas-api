const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    default: null,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null,
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {timestamps: true});

module.exports = mongoose.model('Like', LikeSchema);