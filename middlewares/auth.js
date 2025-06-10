const jwt = require('jsonwebtoken');
const { Role, User } = require('../models/index.js');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token =
    authHeader && authHeader.split(' ')[0].toLowerCase() === 'bearer'
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    return res.status(403).json({ message: 'Access denied, token missing' });
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

    const user = await User.findByPk(userId, {
      include: [{ model: Role }],
    });

    if (!user) {
      const userWithoutRole = await User.findByPk(userId);
      console.log('User found without Role:', userWithoutRole ? 'Yes' : 'No');

      return res.status(401).json({
        message: 'User not found',
        userId: userId,
        tokenData: decoded,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

module.exports = authenticateToken;
