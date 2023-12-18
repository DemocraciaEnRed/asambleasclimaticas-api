const Article = require('../models/article');
const Comment = require('../models/comment');
const Project = require('../models/project');
const Like = require('../models/like');
const user = require('../models/user');
const Reply = require('../models/reply');


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



exports.listProjects = async (page = 1, limit = 10) => {
  try {
    const projects = []
    // get the projects by page
    const query = {
      hidden: false,
      publishedAt: {$ne: null}
     }
    const projectList = await Project.find(query).populate({
      path: 'author',
      select: '_id name country',
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

exports.getProject = async (projectId, version = null) => {
  try {
    const projectOutput = {}
    const project = await Project.findOne({ _id: projectId }).populate({
      path: 'author',
      select: '_id name country',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    });
    projectOutput._id = project._id;
    projectOutput.slug = project.slug;
    projectOutput.author = project.author;
    projectOutput.title_es = project.title_es;
    projectOutput.title_pt = project.title_pt;
    projectOutput.coverUrl = project.coverUrl;
    projectOutput.youtubeUrl = project.youtubeUrl;
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
    projectOutput.published = project.published;
    projectOutput.createdAt = project.createdAt;
    projectOutput.updatedAt = project.updatedAt;
    // what is the current version?
    if(!version || version === project.version || version == 1) {
      // if no version is specified,
      // or if the version is the current version,
      // then we return the project as it is
      projectOutput.about_es = project.about_es;
      projectOutput.about_pt = project.about_pt;  
      projectOutput.version = project.version;
    }

    if(version && version !== project.version && version > 1 && version <= project.version) {
      // if version is specified, then we need to get the project from that version
      // project.versions is a array of subdocuments, so we need to find the subdocument with that version
      const projectVersion = project.versions.find(version => version.version === version);
      projectOutput.about_es = projectVersion.about_es;
      projectOutput.about_pt = projectVersion.about_pt;
      projectOutput.version = projectVersion.version;
      projectOutput.versionCreatedAt = projectVersion.createdAt;
      projectOutput.versionUpdatedAt = projectVersion.updatedAt;
    }
    
    return projectOutput;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.getArticles = async (projectId, version = null) => {
  try {
    const articles = []
    // what is the current version?
    const project = await Project.findById(projectId);
    if(!version || version === project.version){
      // if no version is specified,
      // or if the version is the current version,
      // then the ids for the articles is in project.articles
      const articlesIds = project.articles
      const projectArr = await Article.find({_id: {$in: articlesIds}}).sort({position: 1});
      for(let i = 0; i < projectArr.length; i++) {
        const article = projectArr[i];
        const articleOutput = {
          _id: article._id,
          text_es: article.text_es,
          text_pt: article.text_pt,
          position: article.position,
          version: project.version,
          likes: await article.getLikesCount(),
          dislikes: await article.getDislikesCount(),
          commentsCount: await article.getCommentsCount(),
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        }
        articles.push(articleOutput);
      }
    }
    if(version && version !== project.version && version > 1 && version <= project.version) {
      // if version is specified, then we need to get the articles from that version
      // project.versions is a array of subdocuments, so we need to find the subdocument with that version
      const projectVersion = project.versions.find(version => version.version === version);
      // now we have the project version, we need to get the articles ids from that version
      const projectVersionArticles = projectVersion.articles;
      const projectArr = await Article.find({project: {$in: projectVersionArticles}}).sort({position: -1});
      for(let i = 0; i < projectArr.length; i++) {
        const article = projectArr[i];
        // article.versions is an array of subdocuments, so we need to find the subdocument with that version
        const articleVersion = article.versions.find(version => version.version === version);
        const articleOutput = {
          _id: article._id,
          text_es: articleVersion.text_es,
          text_pt: articleVersion.text_pt,
          version: projectVersion.version,
          position: articleVersion.position,
          createdAt: articleVersion.createdAt,
          updatedAt: articleVersion.updatedAt,
        }
        articles.push(articleOutput);
      }
      // now we need to sort the articles by position
      articles.sort((a, b) => a.position - b.position);
    }
  
    return articles;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.listComments = async (projectId, articleId = null, version = null, page = 1, limit = 10, includeHighlighted = false, includeResolved = false) => {
  try {
    // get the project version
    const project = await Project.findById(projectId);
    const comments = []
    // The base query requires the project id, and the article must be null
    // Also, the createdInVersion must be less than or equal to the version
    const query = {
      project: projectId,
      article: articleId,
    }
    // if version is null, or if the version is the current version,
    // then we need to include the highlighted and resolved messages
    if(!version || project.version == version || version == 1) {
      // include all the messages that:
      // - createdInVersion is less than or equal to the version
      // - and any of the following is true:
      //   - highlightedInVersion is equal to version (highlighted in this version)
      //   - resolvedInVersion is equal to version (resolved in this version)
      //   - highlightedInVersion is 0 (not highlighted yet)
      //   - resolvedInVersion is 0 (not resolved yet)
      query.createdInVersion = {$lte: project.version};
      query.$or = [
        { highlightedInVersion: 0 },
        { highlightedInVersion: project.version },
        { resolvedInVersion: 0 },
        { resolvedInVersion: project.version }
      ]
    }
    if(version !== project.version && version > 1 && version <= project.version) {
      // we show the messages that:
      // - createdInVersion is less than or equal to the version
      // - and highlightedInVersion is equal to version (highlighted in this version)
      // - and resolvedInVersion is equal to version (resolved in this version)
      query.createdInVersion = {$lte: version};
      query.highlightedInVersion = version;
      query.resolvedInVersion = version;
    }
    // this one is easier, we just need to get the comments for the project
    // that is, comments that have project != null, and article == null
    // const comments = await Comment.find({ project: projectId, article: null }).populate({
    //   path: 'user',
    //   select: '_id name country',
    //   populate: {
    //     path: 'country',
    //     select: '_id name code emoji unicode image'
    //   }
    // }).populate({
    //   path: 'replies',
    //   select: '_id text createdAt updatedAt',
    //   order: {createdAt: -1},
    //   populate: {
    //     path: 'user',
    //     select: '_id name country',
    //     populate: {
    //       path: 'country',
    //       select: '_id name code emoji unicode image'
    //     }
    //   }
    // }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
    const commentsArr = await Comment.find(query).populate({
      path: 'user',
      select: '_id name country',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);

    for(let i = 0; i < commentsArr.length; i++) {
      const comment = commentsArr[i];
      const commentOutput = {}
      commentOutput._id = comment._id;
      commentOutput.user = comment.user;
      commentOutput.project = comment.project;
      commentOutput.article = comment.article;
      commentOutput.text = comment.text;
      commentOutput.likes = await comment.getLikesCount();
      commentOutput.dislikes = await comment.getDislikesCount();
      commentOutput.repliesCount = await comment.getRepliesCount();
      commentOutput.createdInVersion = comment.createdInVersion;
      commentOutput.highlightedInVersion = comment.highlightedInVersion;
      commentOutput.resolvedInVersion = comment.resolvedInVersion;
      commentOutput.createdAt = comment.createdAt;
      commentOutput.updatedAt = comment.updatedAt;
      comments.push(commentOutput);
    }

    // get pagination metadata
    const total = await Comment.countDocuments(query); // get total of projects
    const pages = Math.ceil(total / limit); // round up to the next integer
    const nextPage = page < pages ? page + 1 : null; // if there is no next page, return null
    const prevPage = page > 1 ? page - 1 : null; // if there is no previous page, return null

    return {
      comments,
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

exports.listReplies = async (commentId, page = 1, limit = 10) => {
  try {
    // get the replies for the comment
    // that is, replies that have comment != null
    const replies = []
    const query = { comment: commentId }
    const repliesArr = await Reply.find(query).populate({
      path: 'user',
      select: '_id name country',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
    for(let i = 0; i < repliesArr.length; i++) {
      const reply = repliesArr[i];
      const replyOutput = {}
      replyOutput._id = reply._id;
      replyOutput.user = reply.user;
      replyOutput.comment = reply.comment;
      replyOutput.text = reply.text;
      //replyOutput.likes = await reply.getLikesCount();
      //replyOutput.dislikes = await reply.getDislikesCount();
      replyOutput.createdAt = reply.createdAt;
      replyOutput.updatedAt = reply.updatedAt;
      replies.push(replyOutput);
    }

    // get pagination metadata
    const total = await Reply.countDocuments(query); // get total of projects
    const pages = Math.ceil(total / limit); // round up to the next integer
    const nextPage = page < pages ? page + 1 : null; // if there is no next page, return null
    const prevPage = page > 1 ? page - 1 : null; // if there is no previous page, return null

    return {
      replies,
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