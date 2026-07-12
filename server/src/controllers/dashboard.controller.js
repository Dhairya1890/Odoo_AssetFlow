const { Op } = require('sequelize');
const { Asset, Allocation, MaintenanceRequest, Booking, TransferRequest } = require('../models');
const { ok, error } = require('../utils/response');

exports.getDashboardKPIs = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      overdueReturns
    ] = await Promise.all([
      Asset.count({ where: { status: 'available' } }),
      Asset.count({ where: { status: 'allocated' } }),
      MaintenanceRequest.count({
        where: {
          createdAt: { [Op.between]: [todayStart, todayEnd] }
        }
      }),
      Booking.count({
        where: {
          status: 'ongoing' // Or upcoming based on definition, let's include ongoing + upcoming if needed
        }
      }),
      TransferRequest.count({ where: { status: 'pending' } }),
      Allocation.count({
        where: {
          status: 'overdue'
        }
      })
    ]);

    // Adjusting active bookings to be 'upcoming' and 'ongoing'
    const activeBookingsCount = await Booking.count({
      where: {
        status: { [Op.in]: ['upcoming', 'ongoing'] }
      }
    });

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
