const express = require('express');
const dayjs = require('dayjs');
const agenda = require('../services/agenda');
const router = express.Router();
const mailer = require('../services/mailer');
const ProjectsHelper = require('../helpers/projectsHelper')
const Project = require('../models/project');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const User = require('../models/user');

router.post('/job', (req, res) => {
  try {


    // agenda.schedule('in 30 seconds', 'test', {message: 'Hello world'})
    agenda.now('send-mail', {
			template: "signup",
      lang: 'es',
			subject: "Confirma tu cuenta",
			to: ['guillermo@gmail.com'],
			url: 'https://google.com'
		})
    
    return res.json({message: 'Job scheduled successfully'})
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
})

router.get('/html', async (req, res) => {
  try {

    // const html = await mailer.renderHtml('signup', {
    //   title: 'ajhshdahasdbsdab'
    // })

    const projectId = '65e0c28219a0c70845508ec2'

    const project = await Project.findById(projectId).populate({
      path: 'author',
      select: '_id name email lang',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    })

    // get all the users that have isVerified = true and are not the owner of the project
    const usersToNotify = await User.find({
      isVerified: true,
      _id: { $ne: project.author._id }
    })

    // pick a random user
    const randomUser = usersToNotify[Math.floor(Math.random() * usersToNotify.length)]

    const data = {
      project: {
        title: randomUser.lang === 'es' ? project.title_es : project.title_pt,
        authorNotes: randomUser.lang === 'es' ? project.authorNotes_es : project.authorNotes_pt,
        slug: project.slug,
        version: project.version,
        updatedAt: dayjs(project.updatedAt).format('DD/MM/YYYY HH:mm'),
      },
      user: {
        name: project.author.name,
        email: project.author.email,
        lang: project.author.lang,
        country: {
          name: project.author.country.name,
          code: project.author.country.code,
          emoji: project.author.country.emoji,
          unicode: project.author.country.unicode,
          image: project.author.country.image,
        }
      } 
    }

    const html = await mailer.renderEmailHtml('newVersion', 'es', data)

    // return as html
    return res.send(html)
    
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
})

router.get('/project/:projectId/stats', async (req, res) => {
  try {
    const stats = await ProjectsHelper.getProjectCurrentStats(req.params.projectId)
    return res.json(stats)
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
})

module.exports = router;
