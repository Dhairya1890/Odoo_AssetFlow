const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ok, created, error } = require('../utils/response');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return error(res, 'Name, email and password are required', 400);

    const exists = await User.findOne({ where: { email } });
    if (exists) return error(res, 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: 'employee' });

    const { passwordHash: _, ...userData } = user.toJSON();
    return created(res, 'Account created successfully', { user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required', 400);

    const user = await User.findOne({ where: { email } });
    if (!user) return error(res, 'Invalid credentials', 401);
    if (user.status === 'inactive') return error(res, 'Account deactivated', 403);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);

    const { passwordHash: _, ...userData } = user.toJSON();
    return ok(res, 'Login successful', { accessToken, refreshToken, user: userData });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required', 400);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.status === 'inactive') return error(res, 'User not found or inactive', 401);

    const accessToken = signToken(user);
    return ok(res, 'Token refreshed', { accessToken });
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT — client discards tokens
  return ok(res, 'Logged out successfully');
};

exports.forgotPassword = async (req, res) => {
  // Stub for hackathon
  return ok(res, 'If this email exists, a password reset link has been sent.');
};
