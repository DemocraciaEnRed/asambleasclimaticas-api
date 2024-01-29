const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const ProjectHelper = require('../helpers/projectsHelper');

exports.listComments = async (req,res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const projectId = req.params.projectId;
    const articleId = req.params.articleId || null;
    const version = parseInt(req.params.version) || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const resData = await ProjectHelper.listComments(projectId, articleId, version, currentUserId, page, limit)
    return res.status(200).json(resData);
  } catch(error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.listReplies = async (req,res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const commentId = req.params.commentId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const resData = await ProjectHelper.listReplies(commentId, currentUserId, page, limit)
    return res.status(200).json(resData);
  } catch(error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.createComment = async (req,res) => {
  try {
    // a comment can be for a project, or an article, or it might be a reply.
    const projectId = req.params.projectId;
    const articleId = req.params.articleId || null;

    const newComment = {
      user: req.user._id,
      project: projectId,
      article: articleId,
      text: req.body.body,
      createdInVersion: req.project.version,
    }

    // create the comment
    const comment = await Comment.create(newComment);

    // return the comment
    return res.status(201).json(comment);
  } catch(error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.resolveComment = async (req,res) => {
  try {
    // to resolve a comment, only the author and admins can do it
    await ProjectHelper.canEdit(req.user, req.project);

    const comment = req.comment;

    // because a comment can be resolved or highlighted, but not both at the same time,
    // we need to check if the comment is highlighted

    // check if the coment is highlighted
    if(comment.highlightedInVersion > 0) {
      // if it is, check if the version is the same as the current one
      if(comment.highlightedInVersion !== req.project.version) {
        // if it is not, return 403
        return res.status(403).json({
          message: 'Comment was highlighted in a previous version. Cannot resolve it.'
        })
      } else {
        // if it is, remove the highlightedInVersion
        comment.highlightedInVersion = 0;
      }
    }

    // if the comment was resolved in a previous version, return 403
    if(
      comment.resolvedInVersion > 0 &&
      req.project.version > comment.resolvedInVersion
    ) {
      return res.status(403).json({
        message: 'Comment was resolved in a previous version. Cannot resolve it.'
      })
    }

    // if the comment was resolved in this version, we can undo it
    if(comment.resolvedInVersion === req.project.version) {
      comment.resolvedInVersion = 0;
      await comment.save();
      return res.status(200).json(comment);
    }

    // if the comment was not resolved in this version, we can resolve it
    comment.resolvedInVersion = req.project.version;
    await comment.save();
    return res.status(200).json(comment);
  } catch(error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.highlightComment = async (req,res) => {
  try {
    // to highlight a comment, only the author and admins can do it
    await ProjectHelper.canEdit(req.user, req.project);

    const comment = req.comment;

    // because a comment can be resolved or highlighted, but not both at the same time,
    // we need to check if the comment is resolved

    // check if the coment is resolved
    if(comment.resolvedInVersion > 0) {
      // if it is, check if the version is the same as the current one
      if(comment.resolvedInVersion !== req.project.version) {
        // if it is not, return 403
        return res.status(403).json({
          message: 'Comment was resolved in a previous version. Cannot highlight it.'
        })
      } else {
        // if it is, remove the resolvedInVersion
        comment.resolvedInVersion = 0;
      }
    }

    // if the comment was highlighted in a previous version, return 403
    if(
      comment.highlightedInVersion > 0 &&
      req.project.version > comment.highlightedInVersion
    ) {
      return res.status(403).json({
        message: 'Comment was highlighted in a previous version. Cannot highlight it.'
      })
    }

    // if the comment was highlighted in this version, we can undo it
    if(comment.highlightedInVersion === req.project.version) {
      comment.highlightedInVersion = 0;
      await comment.save();
      return res.status(200).json(comment);
    }

    // if the comment was not highlighted in this version, we can highlight it
    comment.highlightedInVersion = req.project.version;
    await comment.save();
    return res.status(200).json(comment);    
  } catch(error) {
    console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.deleteComment = async (req,res) => {
  try {
    // to delete a comment, only the author, admins and moderators can do it
    await ProjectHelper.canModerate(req.user, req.project);

    const comment = req.comment;

    // before doing anything, if the project is closed, return 403
    // project.closed is a virtual
    if(req.project.closed) {
      return res.status(403).json({ message: 'Project is closed. The time to comment has ended.' })
    }

    // if the comment was highlighted, and in a previous version, return 403
    if(
      comment.highlightedInVersion > 0 &&
      req.project.version > comment.highlightedInVersion
    ) {
      return res.status(403).json({
        message: 'Comment was highlighted in a previous version. Cannot delete it.'
      })
    }

    // if the comment was resolved, and in a previous version, return 403
    if(
      comment.resolvedInVersion > 0 &&
      req.project.version > comment.resolvedInVersion
    ) {
      return res.status(403).json({
        message: 'Comment was resolved in a previous version. Cannot delete it.'
      })
    }
    
    // TODO Can the user itself delete their own comments?
    
    
    // first we need to delete all the likes to the comment
    await Like.deleteMany({ comment: comment._id });

    // delete all the replies associated to that comment
    await Reply.deleteMany({ comment: comment._id });

    await comment.remove();
    
    return res.status(200).json({ message: 'Comment deleted' });

  } catch(error) {
    console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.createReply = async (req,res) => {
  try {
    const comment = req.comment

    // a reply is for a comment, req.comment.replies is an array of subdocuments "Reply"
    const newReply = {
      user: req.user._id,
      comment: req.comment._id,
      text: req.body.body,
    }
    // create the reply
    const reply = await Reply.create(newReply);
    // add the reply to the comment
    comment.replies.push(reply._id);
    // save comment
    comment.save()
    return res.status(201).json(reply)
  } catch(error) {
    console.error(error)
		return res.status(500).json({ message: req.__('error.default') });
  }
}

exports.deleteReply = async (req,res) => {
  try {
    const reply = req.reply

    // to delete a comment, only the author, admins and moderators can do it
    const canModerate = await ProjectHelper.canModerate(req.user, req.project);
    if(!canModerate) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const replyId = req.params.replyId;

    // delete the reply
    await reply.remove();

    // delete the reply from the comment
    const comment = req.comment;
    comment.replies.pull(replyId); // TODO Test this!!!!

    // save the comment
    await comment.save();

    return res.status(200).json({ message: 'Reply deleted' });
  } catch (error) {
    console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}
