const { ActivityLog, User } = require('../models');
const { ok, error } = require('../utils/response');

exports.getLogs = async (req, res) => {
  try {
    const whereClause = req.user.role === 'employee' ? { userId: req.user.id } : {};
    
    const logs = await ActivityLog.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 100, // Reasonable limit for recent activity
    });
    return ok(res, 'Activity logs fetched', { logs });
  } catch (err) {
    return error(res, err.message);
  }
};
