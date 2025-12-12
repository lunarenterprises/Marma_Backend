const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is not set");
}

module.exports.GenerateToken = async (payload, expiresIn = JWT_EXPIRES_IN) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
};
