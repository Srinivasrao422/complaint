/** Blocks staff admins; only super_admin JWT may proceed. */
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    });
  }
  if (req.user?.adminRole === 'staff') {
    return res.status(403).json({
      success: false,
      message: 'This action requires a super administrator.',
    });
  }
  next();
}

module.exports = requireSuperAdmin;
