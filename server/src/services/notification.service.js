let _io = null;
const { Notification } = require('../models');

/**
 * Call this once from app.js after socket.io is initialized.
 */
const init = (io) => {
  _io = io;
};

/**
 * Persist a notification to DB and emit to the user's socket room.
 */
const notify = async (userId, type, message, metadata = null) => {
  const notification = await Notification.create({ userId, type, message, metadata });
  if (_io) {
    _io.to(`user_${userId}`).emit('notification', {
      id: notification.id,
      type,
      message,
      metadata,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }
  return notification;
};

module.exports = { init, notify };
