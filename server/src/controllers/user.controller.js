const { User, Department } = require('../models');
const { ok, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
    });
    return ok(res, 'Users fetched', { users });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Allow admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id))
      return error(res, 'Forbidden', 403);

    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
    });
    if (!user) return error(res, 'User not found', 404);
    return ok(res, 'User fetched', { user });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowed = ['admin', 'asset_manager', 'department_head', 'employee'];
    if (!allowed.includes(role))
      return error(res, `Role must be one of: ${allowed.join(', ')}`, 400);

    const user = await User.findByPk(id);
    if (!user) return error(res, 'User not found', 404);
    
    if (req.user.id === parseInt(id) && role !== 'admin') {
      return error(res, 'You cannot demote yourself from the admin role', 400);
    }

    await user.update({ role });
    await log(req.user.id, 'USER_ROLE_CHANGED', 'User', user.id, { newRole: role });
    const { passwordHash: _, ...userData } = user.toJSON();
    return ok(res, 'Role updated', { user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return error(res, 'Status must be active or inactive', 400);

    const user = await User.findByPk(id);
    if (!user) return error(res, 'User not found', 404);

    await user.update({ status });
    const { passwordHash: _, ...userData } = user.toJSON();
    return ok(res, 'Status updated', { user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateSelf = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id)) return error(res, 'Forbidden', 403);

    const { name, departmentId } = req.body;
    const user = await User.findByPk(id);
    if (!user) return error(res, 'User not found', 404);

    await user.update({ name, departmentId });
    const { passwordHash: _, ...userData } = user.toJSON();
    return ok(res, 'Profile updated', { user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role, departmentId } = req.body;
    if (!name || !email) return error(res, 'Name and email are required', 400);

    const bcrypt = require('bcryptjs');
    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already exists', 409);

    const passwordHash = await bcrypt.hash('AssetFlow@123', 10);
    const user = await User.create({
      name, email, passwordHash, role: role || 'employee', departmentId, status: 'active'
    });

    const { passwordHash: _, ...userData } = user.toJSON();
    await log(req.user.id, 'USER_CREATED', 'User', user.id, { email });
    return ok(res, 'User created successfully', { user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

    const user = await User.findByPk(id);
    if (!user) return error(res, 'User not found', 404);

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    await user.update({ passwordHash });
    
    await log(req.user.id, 'USER_PASSWORD_RESET', 'User', user.id, { message: 'Admin reset password' });
    return ok(res, 'Password updated successfully');
  } catch (err) {
    return error(res, err.message);
  }
};
