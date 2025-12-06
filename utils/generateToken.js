const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

module.exports.GenerateToken = async (data) => {
    return jwt.sign(data, SECRET_KEY, { expiresIn: '2h' }); 
};
