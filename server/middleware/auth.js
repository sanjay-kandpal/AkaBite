const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  console.log('Auth middleware triggered');
  console.log('Headers:', req.headers);
  
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('No token found in x-auth-token header');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Attempting to verify token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully. Decoded:', decoded);
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};