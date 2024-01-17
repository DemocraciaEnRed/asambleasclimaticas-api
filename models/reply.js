const mongoose = require('mongoose');
const Like = require('./like');
const like = require('./like');

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
  return like.countDocuments({reply: this._id, type: 'like'}, cb);
}

ReplySchema.methods.getDislikesCount = function(cb) {
  return like.countDocuments({reply: this._id, type: 'dislike'}, cb);
}

// get if user has liked or disliked the reply
ReplySchema.methods.getIfLikedOrDislikedByUser = async function (userId) {
  if(!userId) {
    return {
      liked: false,
      disliked: false
    }
  }
  const likeStatus = await Like.findOne({comment: this.comment, reply: this._id, user: userId});
  return {
    liked: likeStatus && likeStatus.type === 'like' || false,
    disliked: likeStatus && likeStatus.type === 'dislike' || false 
  }
}

module.exports = mongoose.model('Reply', ReplySchema);