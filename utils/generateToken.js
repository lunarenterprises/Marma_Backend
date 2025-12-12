const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is not set");
}

module.exports.generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
};
