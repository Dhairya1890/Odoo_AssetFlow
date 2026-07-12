const { Op } = require('sequelize');
const { Asset, Allocation, MaintenanceRequest, Booking, TransferRequest } = require('../models');
const { ok, error } = require('../utils/response');

exports.getDashboardKPIs = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const isEmployee = req.user.role === 'employee';
    const userAllocWhere = isEmployee ? { userId: req.user.id } : {};
    const userBookingWhere = isEmployee ? { userId: req.user.id, status: { [Op.in]: ['upcoming', 'ongoing'] } } : { status: { [Op.in]: ['upcoming', 'ongoing'] } };
    const userMaintWhere = isEmployee ? { raisedById: req.user.id, createdAt: { [Op.between]: [todayStart, todayEnd] } } : { createdAt: { [Op.between]: [todayStart, todayEnd] } };

    const [
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookingsCount,
      pendingTransfers,
      overdueReturns
    ] = await Promise.all([
      Asset.count({ where: { status: 'available' } }),
      isEmployee 
        ? Allocation.count({ where: { ...userAllocWhere, status: 'active' } })
        : Asset.count({ where: { status: 'allocated' } }),
      MaintenanceRequest.count({ where: userMaintWhere }),
      Booking.count({ where: userBookingWhere }),
      TransferRequest.count({ where: { status: 'pending' } }), // Simplifying for now
      Allocation.count({ where: { ...userAllocWhere, status: 'overdue' } })
    ]);

    return ok(res, 'Dashboard KPIs fetched', {
      kpis: {
        assetsAvailable,
        assetsAllocated,
        maintenanceToday,
        activeBookings: activeBookingsCount,
        pendingTransfers,
        overdueReturns
      }
    });
  } catch (err) {
    return error(res, err.message);
  }
};
