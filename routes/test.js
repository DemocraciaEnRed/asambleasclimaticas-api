const express = require('express');
const agenda = require('../services/agenda');
const router = express.Router();
const mailer = require('../services/mailer');

router.post('/job', (req, res) => {
  try {


    agenda.schedule('in 30 seconds', 'test', {message: 'Hello world'})
    
    return res.json({message: 'Job scheduled successfully'})
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
})

router.get('/html', async (req, res) => {
  try {

    const html = await mailer.renderHtml('signup', {
      title: 'ajhshdahasdbsdab'
    })

    // return as html
    return res.send(html)
    
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
})

module.exports = router;
