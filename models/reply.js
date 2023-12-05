const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  text: {
    type: String,
    required: true
  },
}, {timestamps: true});

ReplySchema.methods.getLikesCount = function(cb) {
  return mongoose.model('Like').count({reply: this._id, type: 'like'}, cb);
}

ReplySchema.methods.getDislikesCount = function(cb) {
  return mongoose.model('Like').count({reply: this._id, type: 'dislike'}, cb);
}

module.exports = mongoose.model('Reply', ReplySchema);