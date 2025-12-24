const jwt = require('jsonwebtoken');
const { Role, User, Therapist } = require('../models/index.js');
const logger = require('../utils/logger');


const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Ensure Authorization header exists
    if (!authHeader) {
      return res.status(403).json({ message: 'Access denied: token missing' });
    }

    const [scheme, token] = authHeader.split(' ');

    // Ensure proper "Bearer <token>" format
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    // Verify JWT
    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.error('JWT verification failed: ' + err.message);
      return res.status(401).json({
        result:false,
        message: 'Invalid or expired token',
      });
    }

    const userId = decoded?.id || decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token: missing user identifier',
      });
    }

    // Fetch user + role
    const user = await User.findByPk(userId, {
      include: [{ model: Role, attributes: ['id', 'name'] }],
    });

    // User not found in DB (maybe deleted)
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: 'Server error in authentication middleware',
    });
  }
};


const LearnerAuthenticateToken = async (req, res, next) => {

  const authHeader = req.header('Authorization');

  const token =
    authHeader && authHeader.split(' ')[0].toLowerCase() === 'bearer'
      ? authHeader.split(' ')[1]
      : null;

  if (!token || token.split('.').length !== 3) {
    return res.status(403).json({ message: 'Access denied, token missing or malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token structure: no user ID found',
        tokenData: decoded,
      });
    }

    const user = await Therapist.findByPk(userId, {
      include: [{ model: Role }],
    });

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
        userId,
        tokenData: decoded,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};


module.exports = {
  authenticateToken,
  LearnerAuthenticateToken
};