const {validationResult} = require('express-validator');

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorsMessage = errors.errors.map(err => err.msg).join(', ')
        let error = {}; errors.array().map((err) => error[err.param] = err.msg);
        return res.status(422).json({message: errorsMessage});
    }

    next();
};