const jwt = require('jsonwebtoken');
const { Role, User, Therapist } = require('../models/index.js');


const authenticateToken = async (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.header('Authorization');
  const token = authHeader && 
    authHeader.split(' ')[0].toLowerCase() === 'bearer'
      ? authHeader.split(' ')[1]
      : null;

  // Check if token exists
  if (!token) {
    return res.status(403).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract userId from token payload
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token: missing user ID'
      });
    }

    // Fetch user with associated Role (single query)
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        attributes: ['id', 'name', 'permissions'] // Specify needed Role fields
      }]
    });

    // Check if user exists
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = userId;
    
    next();
    
  } catch (error) {
    console.error('JWT verification failed:', {
      name: error.name,
      message: error.message,
      userId: decoded?.id || decoded?.userId
    });

    let message = 'Invalid or expired token';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format.';
    }

    return res.status(401).json({ 
      message 
    });
  }
};



// const LearnerAuthenticateToken = async (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   const token =
//     authHeader && authHeader.split(' ')[0].toLowerCase() === 'bearer'
//       ? authHeader.split(' ')[1]
//       : null;

//   if (!token) {
//     return res.status(403).json({ message: 'Access denied, token missing' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const userId = decoded.id || decoded.userId;

//     if (!userId) {
//       return res.status(401).json({
//         message: 'Invalid token structure: no user ID found',
//         tokenData: decoded,
//       });
//     }
//     const user = await Therapist.findByPk(userId, {
//       include: [{ model: Role }],
//     });

//     if (!user) {
//       const userWithoutRole = await Therapist.findByPk(userId);
//       console.log('User found without Role:', userWithoutRole ? 'Yes' : 'No');

//       return res.status(401).json({
//         message: 'User not found',
//         userId: userId,
//         tokenData: decoded,
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     return res.status(401).json({
//       message: 'Invalid or expired token',
//       error: error.message,
//     });
//   }
// };

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