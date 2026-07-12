const cron = require('node-cron');
const { Op } = require('sequelize');
const { Booking } = require('../models');
const notificationService = require('../services/notification.service');

/**
 * Runs every 15 minutes to check for upcoming bookings that start in exactly 1 hour.
 */
const startBookingReminder = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron] Running booking reminder check...');
    try {
      const now = new Date();
      const oneHourFromNowStart = new Date(now.getTime() + 60 * 60 * 1000); // exactly 1 hour from now
      // Let's find bookings starting within the next 15-minute window roughly 1 hour from now
      const oneHourFromNowEnd = new Date(now.getTime() + 75 * 60 * 1000); 

      const upcomingBookings = await Booking.findAll({
        where: {
          status: 'upcoming',
          startTime: {
            [Op.gte]: oneHourFromNowStart,
            [Op.lt]: oneHourFromNowEnd,
          },
        },
      });

      for (const booking of upcomingBookings) {
        await notificationService.notify(
          booking.userId,
          'booking_reminder',
          `Reminder: Your booking for asset ID ${booking.assetId} starts in approximately 1 hour.`,
          { bookingId: booking.id, assetId: booking.assetId }
        );
      }

      if (upcomingBookings.length > 0) {
        console.log(`[Cron] Sent ${upcomingBookings.length} booking reminder(s).`);
      }
    } catch (err) {
      console.error('[Cron] Booking reminder error:', err.message);
    }
  });

  console.log('[Cron] Booking reminder scheduled (every 15 mins).');
};

module.exports = { startBookingReminder };
