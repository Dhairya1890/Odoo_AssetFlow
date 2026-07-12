const { Allocation, User } = require('../models');

/**
 * Checks if an asset is currently allocated (status = 'active' | 'overdue' | 'transfer_requested').
 * Returns the current holder's info if blocked, or null if free.
 */
const checkAllocationConflict = async (assetId) => {
  const existing = await Allocation.findOne({
    where: {
      assetId,
      status: ['active', 'overdue', 'transfer_requested'],
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });

  if (!existing) return null;
  return { heldBy: existing.user };
};

module.exports = { checkAllocationConflict };
