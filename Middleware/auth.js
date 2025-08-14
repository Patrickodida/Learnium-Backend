// Ensures user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Role-based check
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};