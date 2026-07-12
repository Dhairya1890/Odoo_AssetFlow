const { Department, User } = require('../models');
const { ok, created, error } = require('../utils/response');

exports.listDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: User, as: 'head', attributes: ['id', 'name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] },
      ],
    });
    return ok(res, 'Departments fetched', { departments });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, parentId, headId, status } = req.body;
    if (!name) return error(res, 'Name is required', 400);

    const dept = await Department.create({ name, parentId, headId, status });
    return created(res, 'Department created', { department: dept });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return error(res, 'Department name already exists', 409);
    return error(res, err.message);
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByPk(id);
    if (!dept) return error(res, 'Department not found', 404);

    await dept.update(req.body);
    return ok(res, 'Department updated', { department: dept });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return error(res, 'Status must be active or inactive', 400);

    const dept = await Department.findByPk(id);
    if (!dept) return error(res, 'Department not found', 404);

    await dept.update({ status });
    return ok(res, 'Department status updated', { department: dept });
  } catch (err) {
    return error(res, err.message);
  }
};
