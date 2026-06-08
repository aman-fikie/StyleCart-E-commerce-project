const jwt = require('jsonwebtoken');

// This runs BEFORE protected routes to verify the user is logged in
const authMiddleware = (req, res, next) => {

  // 1. Get token from Authorization header
  // Frontend sends: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied — please log in' });
  }

  try {
    // 2. Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to the request so routes can use it
    req.user = decoded;

    // 4. Move on to the actual route
    next();

  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token — please log in again' });
  }
};

module.exports = authMiddleware;