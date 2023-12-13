const authRoutes = require('./auth');
const testRoutes = require('./test');
const miscRoutes = require('./misc');
const projectsRoutes = require('./projects');
const usersRoutes = require('./users');
const adminRoutes = require('./admin');
// const authenticate = require('../middlewares/authenticate');

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).json({message: "Welcome to the API"});
    });
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/users', usersRoutes);
    app.use('/projects', projectsRoutes);
    app.use('/misc', miscRoutes);
    app.use('/test', testRoutes);
};