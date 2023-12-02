const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true
  },
}, {timestamps: true});

module.exports = mongoose.model('Reply', ReplySchema);
