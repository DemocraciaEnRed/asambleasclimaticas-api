const Project = require('../models/project');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const Like = require('../models/like');
const ProjectHelper = require('../helpers/projectsHelper');

exports.listEvents = async (req, res) => {
  try {
    const project = req.project
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // get the events
    const events = project.events.sort((a, b) => b.date - a.date)
    // paginate the events
    const total = events.length
    const pages = Math.ceil(total / limit)
    const offset = limit * (page - 1)
    events.splice(0, offset)
    events.splice(limit, events.length - limit)

    const resData = {
      events: events,
      total: total,
      pages: pages,
      page: page,
      limit: limit
    }


    // return the events
    return res.status(200).json(resData)
  } catch(error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
  }
}

exports.createEvent = async (req, res) => {
  try {
    // first, get the project
    const projectId = req.params.id;
    const project = req.project

    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, projectId)

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
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
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

    // TODO A middleware already handles this, so we can remove this check
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
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
  }
}
