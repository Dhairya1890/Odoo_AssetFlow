const { Booking, Asset, User } = require('../models');
const { checkBookingOverlap } = require('../services/booking.service');
const { ok, created, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');

exports.listBookings = async (req, res) => {
  try {
    const { assetId, userId, status } = req.query;
    const where = {};
    if (assetId) where.assetId = assetId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['startTime', 'ASC']],
    });
    return ok(res, 'Bookings fetched', { bookings });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
      order: [['startTime', 'ASC']],
    });
    return ok(res, 'My bookings fetched', { bookings });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { assetId, startTime, endTime, notes } = req.body;
    if (!assetId || !startTime || !endTime) return error(res, 'assetId, startTime and endTime are required', 400);

    if (new Date(endTime) <= new Date(startTime))
      return error(res, 'endTime must be after startTime', 400);

    const asset = await Asset.findByPk(assetId);
    if (!asset) return error(res, 'Asset not found', 404);
    if (!asset.isBookable) return error(res, 'Asset is not bookable', 400);

    const overlap = await checkBookingOverlap(assetId, startTime, endTime);
    if (overlap) return error(res, 'Time slot overlaps with an existing booking', 409, [overlap]);

    let initialStatus = 'pending';
    if (['admin', 'asset_manager', 'department_head'].includes(req.user.role)) {
      initialStatus = 'approved';
    }

    const booking = await Booking.create({
      assetId, userId: req.user.id, startTime, endTime, notes, status: initialStatus,
    });

    const { Allocation, TransferRequest } = require('../models');
    const activeAllocation = await Allocation.findOne({
      where: { assetId, status: ['active', 'overdue'] },
    });
    const fromUserId = activeAllocation ? activeAllocation.userId : null;

    await TransferRequest.create({
      assetId,
      fromUserId,
      toUserId: req.user.id,
      requestedById: req.user.id,
      notes: `Booking for ${new Date(startTime).toLocaleDateString()}: ${notes || ''}`,
      expectedReturnDate: endTime,
      status: initialStatus,
      approvedById: initialStatus === 'approved' ? req.user.id : null,
    });

    await log(req.user.id, 'BOOKING_CREATED', 'Booking', booking.id, { assetId, startTime, endTime });
    return created(res, 'Booking created', { booking });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return error(res, 'Booking not found', 404);

    const isSelf = booking.userId === req.user.id;
    const isManager = ['admin', 'asset_manager'].includes(req.user.role);
    if (!isSelf && !isManager) return error(res, 'Forbidden', 403);

    if (['completed', 'cancelled'].includes(booking.status))
      return error(res, 'Booking cannot be cancelled', 400);

    await booking.update({ status: 'cancelled' });
    await log(req.user.id, 'BOOKING_CANCELLED', 'Booking', booking.id, {});
    return ok(res, 'Booking cancelled', { booking });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rescheduleBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return error(res, 'Booking not found', 404);
    if (booking.userId !== req.user.id) return error(res, 'Forbidden', 403);
    if (booking.status !== 'upcoming') return error(res, 'Only upcoming bookings can be rescheduled', 400);

    if (new Date(endTime) <= new Date(startTime))
      return error(res, 'endTime must be after startTime', 400);

    const overlap = await checkBookingOverlap(booking.assetId, startTime, endTime, booking.id);
    if (overlap) return error(res, 'New time slot overlaps with an existing booking', 409, [overlap]);

    await booking.update({ startTime, endTime });
    return ok(res, 'Booking rescheduled', { booking });
  } catch (err) {
    return error(res, err.message);
  }
};
