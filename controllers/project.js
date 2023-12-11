const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const ProjectHelper = require('../helpers/project');

// DONE
exports.list = async (req, res) => {
  try {
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
    // get the projects
    const resData = await ProjectHelper.listProjects(page, limit);
    // return the projects
    return res.status(200).json(resData);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.get = async (req, res) => {
  try{
    const projectId = req.project._id;
    const withArticles = req.query.withArticles || false;
    const withComments = req.query.withComments || false;
    // return the project
    const project = await ProjectHelper.getProject(projectId);
    // if the query param withArticles is true, add the articles to the project
    // NOTE they dont come with comments
    if(withArticles) {
      // get the articles
      const articles = await ProjectHelper.getArticles(projectId);
      project.articles = articles;
    }
    // if the query param withComments is true, add the comments to the project
    // TODO if they are too many we shouldnt attach it
    if(withComments) {
      // get the comments
      const comments = await ProjectHelper.getProjectComments(projectId);
      project.comments = comments;
    }
      
    return res.status(200).json(project);
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}
exports.create = async (req, res) => {
  try {
    const projectData = {
      user: req.user._id,
      title_es: req.body.title_es,
      title_pt: req.body.title_pt,
      path_es: req.body.path_es,
      path_pt: req.body.path_pt,
      about_es: req.body.about_es,
      about_pt: req.body.about_pt,
      version: 1,
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
        body_es: articles[i].body_es,
        body_pt: articles[i].body_pt,
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

exports.update = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)

    // project should be in req.project
    const project = req.project;
    // update the project
    project.title_es = req.body.title_es;
    project.title_pt = req.body.title_pt;
    project.path_es = req.body.path_es;
    project.path_pt = req.body.path_pt;
    project.about_es = req.body.about_es;
    project.about_pt = req.body.about_pt;

    // save the project
    await project.save();

    // return
    return res.status(200).json(project);
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.publish = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.project)

    // project should be in req.project
    const project = req.project;

    // if the project is already published, return 403
    if(project.publishedAt !== undefined) {
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
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.toggleHide = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.project)

    // if project is not published, cannot unhide it
    if(req.project.publishedAt === undefined) {
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

exports.newVersion = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)

    // project should be in req.project
    const project = req.project

    // we need to create a new version
    const oldVersion = {
      about_es: project.about_es,
      about_pt: project.about_pt,
      articles: project.articles,
      version: project.version,
    }
    // add the new version to the project
    project.versions.push(oldVersion);

    // req.body.articles is an array of objects that contains {_id, body_es, body_pt, position}
    // articles with _id are existing articles, articles without _id are new articles
    // if an _id is not found, then the article was deleted
    const articles = req.body.articles;
    const articlesIds = [];
    
    for(let i = 0; i < articles.length; i++) {
      // if the article has an _id, it is an existing article
      if(articles[i]._id) {
        const article = await Article.findById(articles[i]._id);
        const previousVersion = {
          body_es: article.body_es,
          body_pt: article.body_pt,
          position: article.position,
          version: project.version
        }
        // add the previous version to the article
        article.versions.push(previousVersion);
        article.body_es = articles[i].body_es;
        article.body_pt = articles[i].body_pt;
        article.position = articles[i].position;
        // save the existing article with its new version stored.
        await article.save();
        // add the article to the project.articles Ids list
        articlesIds.push(article._id);
      } else {
        // if the article doesn't have an _id, it is a new article
        const articleData = {
          project: project._id,
          body_es: articles[i].body_es,
          body_pt: articles[i].body_pt,
          position: articles[i].position,
        }
        // create the article
        const article = await Article.create(articleData);
        // add the article to the project.articles Ids list
        articlesIds.push(article._id);
      }
    }

    // now update the project
    project.title_es = req.body.title_es;
    project.title_pt = req.body.title_pt;
    project.path_es = req.body.path_es;
    project.path_pt = req.body.path_pt;
    project.about_es = req.body.about_es;
    project.about_pt = req.body.about_pt;
    project.articles = articlesIds;
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

exports.createEvent = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)

    // first, get the project
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    // if the project doesn't exists, return 404
    if(!project){
      return res.status(404).json({ message: 'Project not found' })
    } 

    // create a new event
    const newEvent = {
      title_es: req.body.title_es,
      title_pt: req.body.title_pt,
      text_es: req.body.text_es,
      text_pt: req.body.text_pt,
      date: new Date()
    }

    // add the event to the project
    project.events.push(newEvent)

    // save the project
    await project.save()

    const createdEvent = project.events[project.events.length - 1]

    // return the created event
    return res.status(201).json({
      message: 'New event created',
      event: createdEvent
    })

  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.deleteEvent = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)

    // first, get the project
    const projectId = req.params.projectId;
    const eventId = req.params.eventId;
    const project = await Project.findById(projectId);

    // if the project doesn't exists, return 404
    if(!project){
      return res.status(404).json({ message: 'Project not found' })
    }

    // remove the event
    project.events.id(eventId).remove();

    // save the project
    await project.save()

    // return the events
    return res.status(200).json({
      message: 'Event deleted'
    })
 
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
      body: req.body.body,
      createdInVersion: project.version,
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
      text: req.body.text,
    }
    // create the reply
    const reply = await Reply.create(newReply);
    // add the reply to the comment
    comment.replies.push(reply._id);
    
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

exports.toggleLike = async (req,res) => {
  try {
    /**
     * A like can be for:
     * - A project (projectId != null && articleId/commentId/replyId == null)
     * - An article (projectId/articleId != null && commentId/replyId == null)
     * - A comment for the project (projectId/commentId != null && articleId/replyId == null)
     * - A reply for a comment for the project (projectId/commentId/replyId != null && articleId == null)
     * - A comment for an article (projectId/articleId/commentId != null && replyId == null)
     * - A reply for a comment for an article (projectId/articleId/commentId/replyId != null)
     */
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const replyId = req.params.replyId || null;
    const resData = {
      result: null
    }

    // check if the user has already liked this
    const like = await Like.findOne({
      user: req.user._id,
      project: projectId,
      article: articleId,
      comment: commentId,
      reply: replyId,
    });

    // if there is no like, create it
    if(!like) {
      const newLike = {
        user: req.user._id,
        project: projectId,
        article: articleId,
        comment: commentId,
        reply: replyId,
        type: 'like'
      }
      await Like.create(newLike);
      resData.result = 'new';
    }

    // if there is a like, delete it
    if(like) {
      // if it is a dislike, change it to like
      if(like.type === 'dislike') {
        like.type = 'like';
        await like.save();
        resData.result = 'changed';
      } else {
        // if it is a like, delete it
        await like.remove();
        resData.result = 'removed';
      }
    }

    return res.status(200).json(resData)
  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.toggleDislike = async (req,res) => {
  try {
    /**
     * A like can be for:
     * - A project (projectId != null && articleId/commentId/replyId == null)
     * - An article (projectId/articleId != null && commentId/replyId == null)
     * - A comment for the project (projectId/commentId != null && articleId/replyId == null)
     * - A reply for a comment for the project (projectId/commentId/replyId != null && articleId == null)
     * - A comment for an article (projectId/articleId/commentId != null && replyId == null)
     * - A reply for a comment for an article (projectId/articleId/commentId/replyId != null)
     */
    const projectId = req.params.projectId || null;
    const articleId = req.params.articleId || null;
    const commentId = req.params.commentId || null;
    const replyId = req.params.replyId || null;
    const resData = {
      result: null
    }
    // check if the user has already liked this
    const like = await Like.findOne({
      user: req.user._id,
      project: projectId,
      article: articleId,
      comment: commentId,
      reply: replyId,
    });

    // if there is no like, create it
    if(!like) {
      const newLike = {
        user: req.user._id,
        project: projectId,
        article: articleId,
        comment: commentId,
        reply: replyId,
        type: 'dislike'
      }
      await Like.create(newLike);
      resData.result = 'new';
    }

    // if there is a like, delete it
    if(like) {
      // if it is a like, change it to dislike
      if(like.type === 'like') {
        like.type = 'dislike';
        await like.save();
        resData.result = 'changed';
      } else {
        // if it is a dislike, delete it
        await like.remove();
        resData.result = 'removed';
      }
    }
    // Return 200
    return res.status(200).json(resData)
  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}