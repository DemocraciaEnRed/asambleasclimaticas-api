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
    return res.status(500).json({ message: error.message })
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
    return res.status(500).json({ message: error.message })
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
    return res.status(500).json({ message: error.message })
  }
}

exports.resolveComment = async (req,res) => {
  try {
    // to resolve a comment, only the author, admins and moderators can do it
    await ProjectHelper.canModerate(req.user, req.project);

    const comment = req.comment;

    comment.resolvedInVersion = req.project.version;
    await comment.save();

    return res.status(200).json(comment);
    
  } catch(error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.highlightComment = async (req,res) => {
  try {
    // to highlight a comment, only the author, admins and moderators can do it
    await ProjectHelper.canModerate(req.user, req.project);

    const comment = req.comment;

    comment.highlightedInVersion = req.project.version;
    await comment.save();

    return res.status(200).json(comment);
    
  } catch(error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.deleteComment = async (req,res) => {
  try {
    // to delete a comment, only the author, admins and moderators can do it
    await ProjectHelper.canModerate(req.user, req.project);

    // before doing anything, if the project is closed, return 403
    // project.closed is a virtual
    if(req.project.closed) {
      return res.status(403).json({ message: 'Project is closed. The time to comment has ended.' })
    }

    // if the comment was highlighted, and in a previous version, return 403
    if(
      req.comment.highlightedInVersion > 0 &&
      req.project.version > req.comment.highlightedInVersion
    ) {
      return res.status(403).json({
        message: 'Comment was highlighted in a previous version. Cannot delete it.'
      })
    }
    
    // TODO Can the user itself delete their own comments?
    
    const comment = req.comment;
    
    // first we need to delete all the likes to the comment
    await Like.deleteMany({ comment: comment._id });

    // delete all the replies associated to that comment
    await Reply.deleteMany({ comment: comment._id });

    await comment.remove();
    
    return res.status(200).json({ message: 'Comment deleted' });

  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
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
    return res.status(500).json({ message: error.message })
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
    return res.status(500).json({ message: error.message })
  }
}
