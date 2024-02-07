const Project = require('../models/project');
const ProjectsHelper = require('../helpers/projectsHelper');
const User = require('../models/user');
const Comment = require('../models/comment');
const Article = require('../models/article');
const Like = require('../models/like');
const Reply = require('../models/reply');



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

exports.getAppStats = async () => {
  try {

    // get the users
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({role: 'admin'});
    const totalAuthors = await User.countDocuments({role: 'author'});
    const totalVerified = await User.countDocuments({isVerified: true});
    const totalUnverified = await User.countDocuments({isVerified: false});
    const totalDeleted = await User.countDocuments({deletedAt: {$ne: null}});
    // count of the users who logged in in the last 30 days
    const last30Days = new Date(new Date().setDate(new Date().getDate() - 30));
    const last30DaysLogins = await User.countDocuments({lastLogin: {$gte: last30Days}});
    // count of the users who logged in in the last 7 days
    const last7Days = new Date(new Date().setDate(new Date().getDate() - 7));
    const last7DaysLogins = await User.countDocuments({lastLogin: {$gte: last7Days}});

    // get the projects
    const totalProjects = await Project.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalProjectsPublished = await Project.countDocuments({publishedAt: {$ne: null}});
    const totalProjectsUnpublished = await Project.countDocuments({publishedAt: null});
    const totalProjectsClosed = await Project.find({closedAt: {$lt: new Date()}}).countDocuments();
    const totalProjectsHidden = await Project.countDocuments({hidden: true});
    const totalComments = await Comment.countDocuments();
    const totalProjectComments = await Comment.countDocuments({project: {$ne: null}, article: null});
    const totalProjectCommentsResolved = await Comment.countDocuments({project: {$ne: null}, article: null, resolvedInVersion: {$gt: 0}});
    const totalProjectCommentsHighlighted = await Comment.countDocuments({project: {$ne: null}, article: null, highlightedInVersion: {$gt: 0}});
    const totalProjectArticleComments = await Comment.countDocuments({project: {$ne: null}, article: {$ne: null}});
    const totalProjectArticleCommentsResolved = await Comment.countDocuments({project: {$ne: null}, article: {$ne: null}, resolvedInVersion: {$gt: 0}});
    const totalProjectArticleCommentsHighlighted = await Comment.countDocuments({project: {$ne: null}, article: {$ne: null}, highlightedInVersion: {$gt: 0}});
    const totalProjectLikes = await Like.countDocuments({project: {$ne: null}, article: null, comment: null, reply: null, type: 'like'});
    const totalProjectDislikes = await Like.countDocuments({project: {$ne: null}, article: null, comment: null, reply: null, type: 'dislike'});
    const totalArticleLikes = await Like.countDocuments({project: {$ne: null}, article: {$ne: null}, comment: null, reply: null, type: 'like'});
    const totalArticleDislikes = await Like.countDocuments({project: {$ne: null}, article: {$ne: null}, comment: null, reply: null, type: 'dislike'});
    const totalReplies = await Reply.countDocuments();

    // // stats per project
    // const projectsStats = []
    // const projects = await Project.find({})

    // for(let i = 0; i < projects.length; i++) {
    //   const project = projects[i];
    //   const theProject = {}
    //   theProject._id = project._id;
    //   theProject.title_es = project.title_es;
    //   theProject.title_pt = project.title_pt;
    //   theProject.stats = await ProjectsHelper.getProjectCurrentStats(project._id);
    //   projectsStats.push(theProject);
    // }

    
    return {
      users: {
        totalUsers,
        totalAdmins,
        totalAuthors,
        totalVerified,
        totalUnverified,
        totalDeleted,
        last30DaysLogins,
        last7DaysLogins,
      },
      projects: {
        totalProjects,
        totalArticles,
        totalProjectsPublished,
        totalProjectsUnpublished,
        totalProjectsClosed,
        totalProjectsHidden,
        totalComments,
        totalProjectComments,
        totalProjectCommentsResolved,
        totalProjectCommentsHighlighted,
        totalProjectArticleComments,
        totalProjectArticleCommentsResolved,
        totalProjectArticleCommentsHighlighted,
        totalProjectLikes,
        totalProjectDislikes,
        totalArticleLikes,
        totalArticleDislikes,
        totalReplies
      },
    }

  } catch (error) {
    console.error(error);
    throw error;
  }
}