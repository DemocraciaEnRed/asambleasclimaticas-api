const {validationResult} = require('express-validator');

module.exports = (req, res, next) => {
    const results = validationResult(req);
    // console.dir(results)
    if (!results.isEmpty()) {
        const errors = results.errors.map(err => {
            return {
                field: err.path,
                // Note: don't send the value, sensitive data could be leaked
                // value: err.value,
                message: req.__(err.msg.includes('validationError.') ? err.msg : `validationError.${err.msg}`)
            }
        });
        return res.status(422).json({message: req.__('validationError.defaultMessage'), errors: errors});
    }

    next();
};