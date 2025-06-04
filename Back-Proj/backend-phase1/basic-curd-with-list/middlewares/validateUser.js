const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required()
});

function validateUser(req, res, next) {
    const { error } = userSchema.validate(req.body);
    if( error ) {
        return res.status(400).json({ error : error.details[0].message });
    }
    next(); // if validation passed, move to the next middleware handler
}

module.exports = validateUser;