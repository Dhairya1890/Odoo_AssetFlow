const { Asset } = require('../models');

/**
 * Generates the next asset tag in format AF-0001.
 * Finds the highest existing tag number and increments.
 */
const generateAssetTag = async () => {
  const last = await Asset.findOne({
    order: [['id', 'DESC']],
    attributes: ['assetTag'],
  });

  if (!last) return 'AF-0001';

  const num = parseInt(last.assetTag.replace('AF-', ''), 10);
  return `AF-${String(num + 1).padStart(4, '0')}`;
};

module.exports = { generateAssetTag };
