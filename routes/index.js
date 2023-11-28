const auth = require('./auth');
const user = require('./user');
const test = require('./test');
const project = require('./project');
const authenticate = require('../middlewares/authenticate');

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).json({message: "Welcome to the API"});
    });
    app.use('/auth', auth);
    app.use('/user', user);
    app.use('/test', test);
    app.use('/project', project);
};