const { validate: uuidValidate } = require('uuid');

const validateUUIDParam = (paramName) => {
    return (req, res, next) => {
        const value = req.params[paramName];
        if (!value) {
            return res.status(400).json({ error: `Missing parameter: ${paramName}` });
        }
        
        if (!uuidValidate(value)) {
            return res.status(400).json({ error: `Invalid UUID format for parameter: ${paramName}` });
        }
        
        next();
    };
};

module.exports = {
    validateUUIDParam
};