const { body } = require('express-validator');
const Comment = require('../models/comment');

exports.createComment = async (projectId, articleId, commentId, userId, body) => {
  try {
    const comment = new Comment({
      project: projectId,
      article: articleId,
      comment: commentId,
      user: userId,
      body: body
    });
    await comment.save();
    return comment;
  } catch (error) {
    throw error;
  }
}

exports.get = async (projectId, articleId) => {
  try {
    // get the first level of comments (comment = null)
    const comments = await Comment.find({project: projectId, article: articleId, comment: null, deletedAt: null}).populate('user').sort({likesCount:-1, createdAt: -1});
    return comments;
  } catch (error) {
    throw error;
  }
}

