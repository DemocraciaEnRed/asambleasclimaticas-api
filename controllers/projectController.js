const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const ProjectHelper = require('../helpers/projectsHelper');
const ArticleHelper = require('../helpers/articleHelper');

// DONE
exports.listProjects = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
    // get the projects
    const resData = await ProjectHelper.listProjects(page, limit, currentUserId);
    // return the projects
    return res.status(200).json(resData);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.getProject = async (req, res) => {
  try{
    const currentUserId = req.user ? req.user._id : null;
    const projectId = req.project._id;
    const theProject = req.project
    const withArticles = req.query.withArticles || false;
  
    // projectAuthorization.isAccesible is called before this controller
    // if code reaches this point, it means the project is accesible to common users
    // or the user is an admin or the author of the project

    // return the project
    const project = await ProjectHelper.getProject(projectId, null, currentUserId);
    

    // NOTE they dont come with comments
    if(withArticles) {
      // get the articles
      const articles = await ProjectHelper.getArticles(projectId, null, currentUserId);
      project.articles = articles;
    }
          
    return res.status(200).json(project);
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.createProject = async (req, res) => {
  try {
    // projectAuthorization.onlyEditors is called before this controller
    // if code reaches this point, it means the user is an admin or the author of the project


    // if user is an admin, the payload might contain an author id
    if(req.user.role == 'admin'){
      // check if the author exists
      if(req.body.author) {
        // if it does, then add it to the project data
        projectData.author = req.body.author;
      } else {
        // if it doesn't, then add the admin user id as the author
        projectData.author = req.user._id;
      }
    }
    // project data
    const projectData = {
      author: req.user._id,
      title_es: req.body.title_es,
      title_pt: req.body.title_pt,
      coverUrl: req.body.coverUrl,
      youtubeUrl: req.body.youtubeUrl,
      slug: req.body.slug,
      about_es: req.body.about_es,
      about_pt: req.body.about_pt,
      stage: req.body.stage,
      closedAt: req.body.closedAt,
      version: 1,
    }
    if(req.body.publishedAt) {
      projectData.publishedAt = req.body.publishedAt;
      projectData.hidden = false;
    }
    // create the project
    const project = await Project.create(projectData);
    
    // req.body.articles is an array of objects that contains body_es & body_pt
    const articles = req.body.articles;
    const articlesIds = [];
    // create each article
    for(let i = 0; i < articles.length; i++) {
      const articleData = {
        project: project._id,
        text_es: articles[i].text_es,
        text_pt: articles[i].text_pt,
        position: i + 1,
      }
      const article = await Article.create(articleData);
      articlesIds.push(article._id);
    }
    // add the articles to the project
    project.articles = articlesIds;
    // save the project
    await project.save();

    
    return res.status(201).json(project);
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.updateProject = async (req, res) => {
  try {
    // projectAuthorization.onlyEditors is called before this controller
    // if code reaches this point, it means the user is an admin or the author of the project

    // project should be in req.project
    const project = req.project;

    // update the project
    project.title_es = req.body.title_es;
    project.title_pt = req.body.title_pt;
    project.slug = req.body.slug;
    project.coverUrl = req.body.coverUrl;
    project.youtubeUrl = req.body.youtubeUrl;
    project.about_es = req.body.about_es;
    project.about_pt = req.body.about_pt;
    project.stage = req.body.stage;
    project.closedAt = req.body.closedAt;

    // if the user is an admin, the payload might contain an author id
    if(req.user.role == 'admin'){
      // check if the author exists
      if(req.body.author) {
        // if it does, then add it to the project data
        project.author = req.body.author;
      }
    }

    // if the project is closed, dont update or do anything to the articles
    if(!project.closed) {
      // req.body.articles is an array of objects that contains {_id, text_es, text_pt, position}
      // articles with _id are existing articles, articles without _id are new articles
      // if an _id is not found, then the article was deleted
      const articles = req.body.articles;
      const articlesIds = [];

      let position = 1;
      for(let i = 0; i < articles.length; i++) {
        // if the article has an _id, it is an existing article
        if(articles[i]._id) {
          const article = await Article.findById(articles[i]._id);
          // if the project is not published, then you can delete articles because the project is a draft
          if(!project.publishedAt){
            // if the article has deleted: true, then delete it
            if(articles[i].deleted) {
              await article.deleteOne()
              continue; 
            }
          }
          // if the article is not deleted, then update it
          article.text_es = articles[i].text_es;
          article.text_pt = articles[i].text_pt;
          article.position = position;
          // save the existing article
          await article.save();
          // add the article to the project.articles Ids list
          articlesIds.push(article._id);
          position++; // increase the position
        } else {
          // if the article has been published, then you cannot add new articles
          if(!project.publishedAt) {
            // if the article doesn't have an _id, it is a new article
            const articleData = {
              project: project._id,
              text_es: articles[i].text_es,
              text_pt: articles[i].text_pt,
              position: position,
            }
            
            // create the article
            const article = await Article.create(articleData);
            // add the article to the project.articles Ids list
            articlesIds.push(article._id);
            position++; // increase the position
          }
        }
      }
      // update the project with the new articles
      project.articles = articlesIds;
    }

    // if(req.body.publishedAt && !project.publishedAt) {
    if(req.body.publishedAt && !project.publishedAt) {
      project.publishedAt = req.body.publishedAt;
      project.hidden = false;
    }

    // save the project
    await project.save();

    // return
    return res.status(200).json(project);
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.publishProject = async (req, res) => {
  try {
    // projectAuthorization.onlyEditors is called before this controller
    // if code reaches this point, it means the user is an admin or the author of the project

    // project should be in req.project
    const project = req.project;

    // if the project is already published, return 403
    if(project.publishedAt) {
      return res.status(403).json({ message: 'Project is already published' })
    }

    // project wasn't published, so we can publish it
    project.publishedAt = new Date();
    // unhide the project
    project.hidden = false;
    // save the project
    await project.save();

    // return
    return res.status(200).json({
      message: 'Project published',
      publishedAt: project.publishedAt,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.toggleHideProject = async (req, res) => {
  try {
    // projectAuthorization.onlyEditors is called before this controller
    // if code reaches this point, it means the user is an admin or the author of the project

    // project should be in req.project
    const project = req.project;
    
    // if project is not published, cannot unhide it
    if(project.publishedAt == null || project.publishedAt == undefined) {
      return res.status(403).json({ message: 'Project is not published. Publish the project before to make it public.' })
    }

    // project was published, toggle the hidden property
    project.hidden = !project.hidden;
    // save the project
    await project.save();

    // return OK status with the new hidden value
    return res.status(200).json({
      hidden: project.hidden,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.createVersion = async (req, res) => {
  try {
    // projectAuthorization.onlyEditors is called before this controller
    // if code reaches this point, it means the user is an admin or the author of the project

    // project should be in req.project
    const project = req.project

    // if the project is not published, return 403
    if(!project.publishedAt) {
      return res.status(403).json({ message: 'Project is not published. Publish the project before making a new version.' })
    }

    // we need to create a new version
    const oldVersion = {
      about_es: project.about_es,
      about_pt: project.about_pt,
      articles: project.articles,
      version: project.version,
    }

    // add the new version to the project
    project.versions.push(oldVersion);

    const projectStats = await ProjectHelper.getProjectCurrentStats(project._id);

    // merge oldVersion with projectStats
    project.versionsStats.push(projectStats);

    // req.body.articles is an array of objects that contains {_id, body_es, body_pt, position, deleted}
    // articles with _id are existing articles, articles without _id are new articles
    // if an _id is not found, then the article was deleted
    const articles = req.body.articles;
    const articlesIds = [];
    
    let position = 1;
    for(let i = 0; i < articles.length; i++) {
      // if the article has an _id, it is an existing article
      if(articles[i]._id) {
        const article = await Article.findById(articles[i]._id);
        const previousVersion = {
          text_es: article.text_es,
          text_pt: article.text_pt,
          position: article.position,
          version: project.version
        }
        // add the previous version to the article
        article.versions.push(previousVersion);

        const articleStats = await ArticleHelper.getArticleCurrentStats(project._id, article._id);
        
        article.versionsStats.push(articleStats);

        if(articles[i].deleted) {
          // project is deleted, but not from the database..
          // it will stay in the database, but project.articles will not contain it
          // it will be in the array of ids of the previous version of the project
          continue
        }

        article.text_es = articles[i].text_es;
        article.text_pt = articles[i].text_pt;
        article.position = position;
        // save the existing article with its new version stored.
        await article.save();
        // add the article to the project.articles Ids list
        articlesIds.push(article._id);
        position++; // increase the position
      } else {
        // if the article doesn't have an _id, it is a new article
        const articleData = {
          project: project._id,
          text_es: articles[i].text_es,
          text_pt: articles[i].text_pt,
          position: position,
        }
        // create the article
        const article = await Article.create(articleData);
        // add the article to the project.articles Ids list
        articlesIds.push(article._id);
        position++; // increase the position
      }
    }

    // now update the project
    project.slug = req.body.slug;
    project.coverUrl = req.body.coverUrl;
    project.youtubeUrl = req.body.youtubeUrl;
    project.title_es = req.body.title_es;
    project.title_pt = req.body.title_pt;
    project.about_es = req.body.about_es;
    project.about_pt = req.body.about_pt;
    project.stage = req.body.stage;
    project.articles = articlesIds;
    project.closedAt = req.body.closedAt;
    project.version = project.version + 1;
    
    // save the project
    await project.save()

    // return
    return res.status(200).json(project);

  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.getArticles = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const projectId = req.project._id;
    const version = req.project.version || null;
    // get the articles
    const resData = await ProjectHelper.getArticles(projectId, version, currentUserId);
    // return the articles
    return res.status(200).json(resData);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.getVersion = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const projectId = req.project._id;
    const version = parseInt(req.params.version) || 1;
    // get the articles
    const resData = await ProjectHelper.getProject(projectId, version, currentUserId);
    // return the articles
    return res.status(200).json(resData);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.getProjectStats = async (req, res) => {
  try {
    const projectId = req.project._id;
    const resData = await ProjectHelper.getProjectCurrentStats(projectId);
    resData._id = projectId;
    return res.status(200).json(resData);
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}