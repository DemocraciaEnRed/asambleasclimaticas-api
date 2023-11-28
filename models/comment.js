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
  body: {
    type: String,
    required: true
  },
  createdInVersion: {
    type: Number
  },
  highlightedInVersion: {
    type: Number
  },
  resolvedInVersion: {
    type: Number
  },
  deletedAt: {
    type: Date
  },
}, {timestamps: true});



module.exports = mongoose.model('Comment', CommentSchema);
