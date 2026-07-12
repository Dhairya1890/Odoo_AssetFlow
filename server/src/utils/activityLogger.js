const { ActivityLog } = require('../models');

/**
 * Write an entry to the ActivityLog table.
 * Call after the main DB operation succeeds.
 */
const log = (userId, action, entityType, entityId, metadata = null) =>
  ActivityLog.create({ userId, action, entityType, entityId, metadata }).catch(() => {
    // Non-fatal — never let logging break the response
  });

module.exports = { log };
