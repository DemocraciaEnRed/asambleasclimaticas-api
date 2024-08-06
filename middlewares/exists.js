const Project = require('../models/project');
const Reply = require('../models/reply');
const Comment = require('../models/comment');
const Article = require('../models/article');
const { query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const isObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
}

/**
 * Middleware exists.project(projectId)
 * @param {String} projectId - Could be a MongoDB ObjectId or a slug
 * @returns {Function} - A middleware function (req, res, next) => { ... } that checks if the project exists and adds it to the request object (req.project)
 */
exports.project = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const isTheIdMongo = isObjectId(projectId);
    let query = {};
    if(isTheIdMongo) {
      // the projectId is a MongoDB ObjectId
      query = { _id: projectId };
    } else {
      // the projectId is a slug
      query = { slug: projectId };
    }
    
    const project = await Project.findOne(query);
    if(!project) {
      return res.status(404).json({ message: req.__('project.error.notFound') });
    }
    // After we get the project, we will force the projectId to be the MongoDB ObjectId
    req.params.projectId = project._id;
    // And we add the project to the request object
    req.project = project;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
  }
}

exports.article = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const articleId = req.params.articleId;
    const article = await Article.findOne({ _id: articleId, project: projectId });
    if(!article) {
      return res.status(404).json({ message: req.__('article.error.notFound') });
    }
    req.article = article;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
  }
}

exports.event = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const eventId = req.params.eventId;
    const project = await Project.findById(projectId);
    const event = project.events.id(eventId);
    if(!event) {
      return res.status(404).json({ message: req.__('event.error.notFound') });
    }
    req.event = event;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
  }
}

exports.comment = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const comment = await Comment.findOne({ _id: commentId, project: projectId, article: articleId });
    if(!comment) {
      return res.status(404).json({ message: req.__('comment.error.notFound') });
    }
    req.comment = comment;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
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
      return res.status(404).json({ message: req.__('reply.error.notFound') });
    }
    req.reply = reply;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
  } 
}

exports.version = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const version = parseInt(req.params.version) || 1;
    const project = await Project.findOne({ _id: projectId, version: { $gte: version } });
    if(!project) {
      return res.status(404).json({ message: req.__('version.error.notFound') });
    }
    req.project = project;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.__('error.default') });
  }
}