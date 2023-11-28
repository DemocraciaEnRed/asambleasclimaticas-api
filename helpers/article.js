const Article = require('../models/article');
const ProjectVersions = require('../models/projectVersion');
const Comment = require('../models/comment');
const CommentHelper = require('./comment');

exports.count = async (projectId) => {
  try {
    const articlesCount = await Article.countDocuments({project: projectId, deletedAt: null});
    return articlesCount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.get = async (projectId) => {
  try {
    const articles = await Article.find({project: projectId, deletedAt: null}).sort({order: 1});
    // for each article, get the comments
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const comments = await CommentHelper.get(projectId, article._id)
      article.comments = comments;
    }
    return articles;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.delete = async (projectId, articleId) => {
  try {
    const article = await Article.findById(articleId);
    article.deletedAt = new Date();
    await article.save();
    return article;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

