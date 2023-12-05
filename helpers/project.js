const Article = require('../models/article');
const Comment = require('../models/comment');
const Project = require('../models/project');
const Like = require('../models/like');
const user = require('../models/user');


exports.list = async (page = 1, limit = 10) => {
  try {
    const projects = []
    // get the projects by page
    const projectList = await Project.find({}).populate('user').sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
    
    for(let i = 0; i < projectList.length; i++) {
      const project = projectList[i];
      const projectOutput = {}
      projectOutput.title_es = project.title_es;
      projectOutput.title_pt = project.title_pt;
      projectOutput.likesCount = await Like.countDocuments({project: projectList[i]._id, article: null, comment: null});
      projectOutput.projectCommentsCount = await Comment.countDocuments({project: projectList[i]._id, article: null, comment: null});
      projectOutput.articleCommentsCount = await Comment.countDocuments({project: projectList[i]._id, article: {$ne: null}, comment: null});
      projectOutput.author = {
        _id: project.author._id,
        name: project.author.name,
      }
    }
    // get all the likes related to the project
    const likes = await Like.find({project: {$in: projectsArr.map(project => project._id)}});

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

exports.canEdit = async (user, project) => {
  try {
    // if user is admin
    if(user.role === 'admin') {
      return true
    }

    // if user is author
    if(user.role === 'author') {
      // check if the user is the author of the project
      return project.author._id === user._id;
    }
  
    // any other user, cannot
    return false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.canModerate = async (user, project) => {
  try {
    // user is admin or moderator, they can moderate any project
    if(user.role === 'admin' || user.role === 'moderator') {
      return true;
    }
    
    // if user is author, then ok
    if(user.role === 'author') {
      return project.author._id === user._id;
    }

    // any other user, cannot
    return false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

