const { StatusCodes } = require('http-status-codes')

exports.validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if(error) return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    next();
}