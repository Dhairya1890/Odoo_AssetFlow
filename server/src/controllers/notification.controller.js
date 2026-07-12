const { Notification } = require('../models');
const { ok, error } = require('../utils/response');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'Notifications fetched', { notifications });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return error(res, 'Notification not found', 404);
    await notification.update({ isRead: true });
    return ok(res, 'Notification marked as read', { notification });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    return ok(res, 'All notifications marked as read');
  } catch (err) {
    return error(res, err.message);
  }
};
