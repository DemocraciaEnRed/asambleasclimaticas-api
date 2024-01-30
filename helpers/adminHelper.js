const Project = require('../models/project');
const User = require('../models/user');


exports.listProjects = async (page = 1, limit = 10) => {
  try {
    const projects = []
    // get the projects by page
    const query = {}
    const projectList = await Project.find(query).populate({
      path: 'author',
      select: '_id name country role',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
     }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
    
    for(let i = 0; i < projectList.length; i++) {
      const project = projectList[i];
      const projectOutput = {}
      projectOutput._id = project._id;
      projectOutput.slug = project.slug;
      projectOutput.author = project.author;
      projectOutput.title_es = project.title_es;
      projectOutput.title_pt = project.title_pt;
      projectOutput.coverUrl = project.coverUrl;
      projectOutput.youtubeUrl = project.youtubeUrl;
      projectOutput.shortAbout_es = project.shortAbout_es;
      projectOutput.shortAbout_pt = project.shortAbout_pt;
      projectOutput.about_es = project.about_es;
      projectOutput.about_pt = project.about_pt;  
      projectOutput.version = project.version;
      projectOutput.eventCount = project.eventsCount;
      projectOutput.articleCount = project.articlesCount;
      projectOutput.versionsCount = project.versionsCount;
      projectOutput.commentsCount = await project.getCommentsCount();
      projectOutput.articleCommentsCount = await project.getArticleCommentsCount();
      projectOutput.likes = await project.getLikesCount();
      projectOutput.dislikes = await project.getDislikesCount();
      projectOutput.stage = project.stage;
      projectOutput.closed = project.closed;
      projectOutput.closedAt = project.closedAt;
      projectOutput.publishedAt = project.publishedAt;
      projectOutput.hidden = project.hidden;
      projectOutput.published = project.published;
      projectOutput.createdAt = project.createdAt;
      projectOutput.updatedAt = project.updatedAt;
      projects.push(projectOutput);
    }

    // get pagination metadata
    const total = await Project.countDocuments(query); // get total of projects
    const pages = Math.ceil(total / limit); // round up to the next integer
    const nextPage = page < pages ? page + 1 : null; // if there is no next page, return null
    const prevPage = page > 1 ? page - 1 : null; // if there is no previous page, return null

    // return the projects with pagination metadata
    return {
      projects,
      page,
      pages,
      total,
      limit,
      nextPage,
      prevPage
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.listAllUsers = async () => {
  try {
    const privateSelect = {
      password: false,
      __v: false,
    };
    const users = await User.find({}, privateSelect).populate('country')
    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
}