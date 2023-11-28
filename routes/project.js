const express = require('express');
const { check } = require('express-validator');
const validate = require('../middlewares/validate');
const Project = require('../controllers/project');
const constants = require('../services/constants');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();


router.get('/', Project.list);
router.get('/:id', [
	check('id').isMongoId().withMessage('Invalid Project ID'),
], validate, Project.get)

router.post('/:id/toggle-hide',
	[
		check('id').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate, 
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	Project.toggleHide
)

module.exports = router;