const Like = require('../models/like');

/**
 * Toggles a like for a project, article, comment or reply.
 * If the user has already liked it, it will be removed.
 * If the user has already disliked it, it will be changed to like.
 * If the user has not liked it, it will be created.
 * 
 * NOTE: If the router is /projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
 * all the params should be present. From the beginning to the end.
 * 
 * NOTE: Watch out, if it is a like for a comment of a project, articleId and replyId should be null.
 * (Comment <- Project)
 * If the dislike is for a comment of an article of a project, then replyId should be null.
 * (Comment <- Article <- Project)
 * 
 * A like can be for:
 * - A project `(projectId != null && articleId/commentId/replyId == null)`
 * - An article `(projectId/articleId != null && commentId/replyId == null)`
 * - A comment for the project `(projectId/commentId != null && articleId/replyId == null)`
 * - A reply for a comment for the project `(projectId/commentId/replyId != null && articleId == null)`
 * - A comment for an article `(projectId/articleId/commentId != null && replyId == null)`
 * - A reply for a comment for an article `(projectId/articleId/commentId/replyId != null)`
 * 
 * @param {ObjectId} req.params.projectId A mongoose ObjectId that represents a project
 * @param {ObjectId} req.params.articleId (Optional) A mongoose ObjectId that represents an article
 * @param {ObjectId} req.params.commentId (Optional) A mongoose ObjectId that represents a comment
 * @param {ObjectId} req.params.replyId (Optional) A mongoose ObjectId that represents a reply
 * @returns {Object} {result: 'new'|'changed'|'removed'}
 */
exports.toggleLike = async (req,res) => {
  try {
    // A like can be for:
    // - A project (projectId != null && articleId/commentId/replyId == null)
    // - An article (projectId/articleId != null && commentId/replyId == null)
    // - A comment for the project (projectId/commentId != null && articleId/replyId == null)
    // - A reply for a comment for the project (projectId/commentId/replyId != null && articleId == null)
    // - A comment for an article (projectId/articleId/commentId != null && replyId == null)
    // - A reply for a comment for an article (projectId/articleId/commentId/replyId != null)
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const replyId = req.params.replyId || null;
    const resData = {
      result: null
    }

    // check if the user has already liked this
    const like = await Like.findOne({
      user: req.user._id,
      project: projectId,
      article: articleId,
      comment: commentId,
      reply: replyId,
    });

    // if there is no like, create it
    if(!like) {
      const newLike = {
        user: req.user._id,
        project: projectId,
        article: articleId,
        comment: commentId,
        reply: replyId,
        type: 'like'
      }
      await Like.create(newLike);
      resData.result = 'new';
    }

    // if there is a like, delete it
    if(like) {
      // if it is a dislike, change it to like
      if(like.type === 'dislike') {
        like.type = 'like';
        await like.save();
        resData.result = 'changed';
      } else {
        // if it is a like, delete it
        await Like.deleteOne({
          user: req.user._id,
          project: projectId,
          article: articleId,
          comment: commentId,
          reply: replyId,
        });
        //await like.remove();
        resData.result = 'removed';
      }
    }

    return res.status(200).json(resData)
  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

/**
 * Toggles a dislike for a project, article, comment or reply.
 * If the user has already disliked it, it will be removed.
 * If the user has already liked it, it will be changed to dislike.
 * If the user has not disliked it, it will be created.
 * 
 * NOTE: If the router is /projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
 * all the params should be present. From the beginning to the end.
 * 
 * NOTE: Watch out, if it is a like for a comment of a project, articleId and replyId should be null.
 * (Comment <- Project)
 * If the dislike is for a comment of an article of a project, then replyId should be null.
 * (Comment <- Article <- Project)
 * 
 * A like can be for:
 * - A project `(projectId != null && articleId/commentId/replyId == null)`
 * - An article `(projectId/articleId != null && commentId/replyId == null)`
 * - A comment for the project `(projectId/commentId != null && articleId/replyId == null)`
 * - A reply for a comment for the project `(projectId/commentId/replyId != null && articleId == null)`
 * - A comment for an article `(projectId/articleId/commentId != null && replyId == null)`
 * - A reply for a comment for an article `(projectId/articleId/commentId/replyId != null)`
 * 
 * @param {ObjectId} req.params.projectId A mongoose ObjectId that represents a project
 * @param {ObjectId} req.params.articleId (Optional) A mongoose ObjectId that represents an article
 * @param {ObjectId} req.params.commentId (Optional) A mongoose ObjectId that represents a comment
 * @param {ObjectId} req.params.replyId (Optional) A mongoose ObjectId that represents a reply
 * @returns {Object} {result: 'new'|'changed'|'removed'}
 */
exports.toggleDislike = async (req,res) => {
  try {
    // A like can be for:
    // - A project (projectId != null && articleId/commentId/replyId == null)
    // - An article (projectId/articleId != null && commentId/replyId == null)
    // - A comment for the project (projectId/commentId != null && articleId/replyId == null)
    // - A reply for a comment for the project (projectId/commentId/replyId != null && articleId == null)
    // - A comment for an article (projectId/articleId/commentId != null && replyId == null)
    // - A reply for a comment for an article (projectId/articleId/commentId/replyId != null)
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const replyId = req.params.replyId || null;
    const resData = {
      result: null
    }
    // check if the user has already liked this
    const like = await Like.findOne({
      user: req.user._id,
      project: projectId,
      article: articleId,
      comment: commentId,
      reply: replyId,
    });

    // if there is no like, create it
    if(!like) {
      const newLike = {
        user: req.user._id,
        project: projectId,
        article: articleId,
        comment: commentId,
        reply: replyId,
        type: 'dislike'
      }
      await Like.create(newLike);
      resData.result = 'new';
    }

    // if there is a like, delete it
    if(like) {
      // if it is a like, change it to dislike
      if(like.type === 'like') {
        like.type = 'dislike';
        await like.save();
        resData.result = 'changed';
      } else {
        // if it is a dislike, delete it
        await Like.deleteOne({
          user: req.user._id,
          project: projectId,
          article: articleId,
          comment: commentId,
          reply: replyId,
        });
        //await like.remove();
        resData.result = 'removed';
      }
    }
    // Return 200
    return res.status(200).json(resData)
  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}
