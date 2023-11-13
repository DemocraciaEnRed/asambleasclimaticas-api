const express = require('express');
const {check} = require('express-validator');
// const multer = require('multer');

const User = require('../controllers/user');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// const upload = multer().single('profileImage');

//INDEX
router.get('/', authenticate(), User.index);
router.get('/me', authenticate(), User.me);

//STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('You username is required'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('lastName').not().isEmpty().withMessage('You last name is required')
], validate, User.store);

//SHOW
router.get('/:id', authenticate('admin'), User.show);

//UPDATE
// router.put('/:id', upload, User.update);
router.put('/:id', authenticate(), User.update);

//DELETE
router.delete('/:id', authenticate(), User.destroy);

module.exports = router;