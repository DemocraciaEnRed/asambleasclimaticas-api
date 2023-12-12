const Project = require('../models/project');
const Reply = require('../models/reply');
const Comment = require('../models/comment');
const Article = require('../models/article');

/**
 * Middleware exists.project(projectId)
 * @param {String} projectId - The project id
 * @returns {Function} - A middleware function (req, res, next) => { ... } that checks if the project exists and adds it to the request object (req.project)
 */
exports.project = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    if(!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    req.project = project;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.article = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const articleId = req.params.articleId;
    const article = await Article.findOne({ _id: articleId, project: projectId });
    if(!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    req.article = article;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.event = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const eventId = req.params.eventId;
    const project = Project.findById(projectId);
    const event = await project.events.id(eventId);
    if(!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    req.event = event;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.comment = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const comment = await Comment.findOne({ _id: commentId, project: projectId, article: articleId });
    if(!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    req.comment = comment;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  } 
}
  
exports.reply = async (req, res, next) => {
  try {
    //const projectId = req.params.projectId || null;
    const commentId = req.params.commentId || null;
    //const articleId = req.params.articleId || null;
    const replyId = req.params.replyId || null;
    const reply = await Reply.findOne({ _id: replyId, comment: commentId });
    if(!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    req.reply = reply;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  } 
}

exports.version = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const version = req.params.version;
    const project = await Project.findOne({ _id: projectId, version: { $gte: version } });
    if(!project) {
      return res.status(404).json({ message: 'Project version not found' });
    }
    req.project = project;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}