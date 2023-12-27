const mongoose = require('mongoose');
const Like = require('./like');
const Reply = require('./reply');

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


CommentSchema.methods.getLikesCount = async function () {
  return await Like.countDocuments({comment: this._id, type: 'like'});
}


CommentSchema.methods.getDislikesCount = async function () {
  return await Like.countDocuments({comment: this._id, type: 'dislike'});
}


CommentSchema.methods.getRepliesCount = async function () {
  return await Reply.countDocuments({comment: this._id});
}

// get if user has liked or disliked the comment
CommentSchema.methods.getIfLikedOrDislikedByUser = async function (userId) {
  if(!userId) {
    return {
      liked: false,
      disliked: false
    }
  }
  const likeStatus = await Like.findOne({project: this.project._id, article: this.article, comment: this._id, user: userId});
  return {
    liked: likeStatus && likeStatus.type === 'like' || false,
    disliked: likeStatus && likeStatus.type === 'dislike' || false
  }
}



module.exports = mongoose.model('Comment', CommentSchema);
