const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const ProjectHelper = require('../helpers/project');

exports.list = async (req, res) => {
  try {
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		
    // get the projects
    const projects = await ProjectHelper.list(page, limit);

		return res.json(output);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.get = async (req, res) => {
  try{

  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.toggleHide = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.project)
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    project.hidden = !project.hidden;
    await project.save();
    // return OK status, no need to return the project
    return res.status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}


exports.create = async (req, res) => {
  try {
    const projectData = {
      title_es: req.body.title_es,
      title_pt: req.body.title_pt,
      path_es: req.body.path_es,
      path_pt: req.body.path_pt,
      about_es: req.body.about_es,
      about_pt: req.body.about_pt,
      user: req.user._id,
      version: 1,
    }

    const project = await Project.create(projectData);
    
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

    // get the project
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
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

exports.newVersion = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)

    // first, get the project
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    // we need to create a new version
    const newVersion = {
      about_es: req.body.about_es,
      about_pt: req.body.about_pt,
      version: project.version,
    }
    // add the new version to the project
    project.versions.push(newVersion);

    // now update the project
    project.title_es = req.body.title_es;
    project.title_pt = req.body.title_pt;
    project.path_es = req.body.path_es;
    project.path_pt = req.body.path_pt;
    project.about_es = req.body.about_es;
    project.about_pt = req.body.about_pt;
    project.version = project.version + 1;

    // TODO probably later there must be some sort of validation notification to do

    // save the project
    await project.save()

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
      return res.status(404).json({ message: 'Project not found' }
    } 

    // create a new event
    const newEvent = {
      title_es: req.body.title_es,
      title_pt: req.body.title_pt,
      body_es: req.body.body_es,
      body_pt: req.body.body_pt,
      date: new Date()
    }

    // add the event to the project
    project.events.push(newEvent)

    // save the project
    await project.save()
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
    return res.status(200).json(project.events) 
 
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
     * - A project (req.params.id != null)
     * - An article (req.params.articleId && req.params.projectId != null)
     * - A comment (req.params.commentId && req.params.projectId != null)
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
     * - A project (req.params.id != null)
     * - An article (req.params.articleId && req.params.projectId != null)
     * - A comment (req.params.commentId && req.params.projectId != null)
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