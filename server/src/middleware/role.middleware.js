const { error } = require('../utils/response');

/**
 * requireRole('admin', 'asset_manager')
 * Returns middleware that blocks if req.user.role is not in the allowed list.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthenticated', 401);
  if (!roles.includes(req.user.role))
    return error(res, 'Forbidden: insufficient role', 403);
  next();
};

module.exports = requireRole;
