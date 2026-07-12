const { Booking, Op } = require('../models');
const { Op: SeqOp } = require('sequelize');

/**
 * Checks for overlapping bookings on an asset.
 * Adjacent bookings (end === start) are allowed.
 * Returns conflicting booking or null.
 */
const checkBookingOverlap = async (assetId, startTime, endTime, excludeId = null) => {
  const where = {
    assetId,
    status: ['upcoming', 'ongoing'],
    startTime: { [SeqOp.lt]: new Date(endTime) },
    endTime: { [SeqOp.gt]: new Date(startTime) },
  };

  if (excludeId) where.id = { [SeqOp.ne]: excludeId };

  const conflict = await Booking.findOne({ where });
  return conflict;
};

module.exports = { checkBookingOverlap };
