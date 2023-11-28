const Article = require('../models/article');
const Comment = require('../models/comment');
const Project = require('../models/project');


exports.list = async (page = 1, limit = 10) => {
  try {
    // get the projects by page
    const projects = await Project.find({deletedAt: null}).populate('user').sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
    
    // get pagination metadata
    const total = await Project.countDocuments({deletedAt: null}); // get total of projects
    const pages = Math.ceil(total / limit); // round up to the next integer
    const nextPage = page < pages ? page + 1 : null; // if there is no next page, return null
    const prevPage = page > 1 ? page - 1 : null; // if there is no previous page, return null

    // return the projects with pagination metadata
    return {
      projects,
      page,
      pages,
      nextPage,
      prevPage
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.get = async (projectId, version = 1) => {
  try {
    if(version == 1) {
      const project = await Project.findById(projectId);
      // get the articles of the project
      const articles = await Article.find({project: projectId, deletedAt: null}).sort({createdAt: -1});
      project.articles = articles;
      const comments = await this.getProjectComments(projectId);
      project.comments = comments;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.canEdit = async (projectId, user) => {
  try {
    if(user.role === 'admin') return true;
    const project = await Project.exists({_id: projectId, author: user._id});
    return project ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.isUserTheProjectAuthor = async (projectId, user) => {
  try {
  } catch (error) {
    console.error(error);
    throw error;
  }
}