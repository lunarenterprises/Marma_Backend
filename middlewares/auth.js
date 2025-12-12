const jwt = require('jsonwebtoken');
const { Role, User, Therapist } = require('../models/index.js');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate Bearer token format
    if (!authHeader) {
      return res.status(403).json({ message: 'Access denied, token missing' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token structure: no user ID found',
        tokenData: decoded,
      });
    }

    // Fetch user with role in one query
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = user; // Attach user object to request

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: error.message,
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