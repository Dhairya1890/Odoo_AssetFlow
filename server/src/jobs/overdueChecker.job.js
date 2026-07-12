const cron = require('node-cron');
const { Op } = require('sequelize');
const { Allocation, Asset } = require('../models');
const notificationService = require('../services/notification.service');

/**
 * Daily midnight job: flip active allocations past their expectedReturnDate to 'overdue'
 * and notify the holder.
 */
const startOverdueChecker = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running overdue allocation checker...');
    try {
      const overdue = await Allocation.findAll({
        where: {
          status: 'active',
          expectedReturnDate: { [Op.lt]: new Date() },
          actualReturnDate: null,
        },
      });

      for (const allocation of overdue) {
        await allocation.update({ status: 'overdue' });
        await notificationService.notify(
          allocation.userId,
          'overdue_return',
          `Your allocation for asset ID ${allocation.assetId} is overdue. Please return it immediately.`,
          { allocationId: allocation.id, assetId: allocation.assetId }
        );
      }

      console.log(`[Cron] Marked ${overdue.length} allocation(s) as overdue.`);
    } catch (err) {
      console.error('[Cron] Overdue checker error:', err.message);
    }
  });

  console.log('[Cron] Overdue checker scheduled (daily at midnight).');
};

module.exports = { startOverdueChecker };
