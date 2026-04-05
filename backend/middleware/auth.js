const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { User } = require('../models');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    const r = decoded.role;
    const adminRole =
      r === 'admin'
        ? decoded.adminRole === 'staff'
          ? 'staff'
          : 'super_admin'
        : undefined;
    req.user = {
      id: decoded.userId,
      role: r === 'admin' ? 'admin' : 'member',
      adminRole,
    };

    if (req.user.role === 'member') {
      const u = await User.findById(req.user.id).select('accountStatus');
      if (u && u.accountStatus === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Contact the administrator.',
        });
      }
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

module.exports = auth;
