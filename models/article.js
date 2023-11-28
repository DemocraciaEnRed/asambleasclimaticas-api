const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
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
  order: {
    type: Number,
    required: true
  },
  deletedAt: {
    type: Date
  },
  history: [VersionSchema]
}, {timestamps: true});

exports.Article = mongoose.model('Article', ArticleSchema);


