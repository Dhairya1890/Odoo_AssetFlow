const { AssetCategory } = require('../models');
const { ok, created, error } = require('../utils/response');

exports.listCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.findAll();
    return ok(res, 'Categories fetched', { categories });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    if (!name) return error(res, 'Name is required', 400);

    const category = await AssetCategory.create({ name, customFields });
    return created(res, 'Category created', { category });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return error(res, 'Category name already exists', 409);
    return error(res, err.message);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await AssetCategory.findByPk(id);
    if (!category) return error(res, 'Category not found', 404);

    await category.update(req.body);
    return ok(res, 'Category updated', { category });
  } catch (err) {
    return error(res, err.message);
  }
};
