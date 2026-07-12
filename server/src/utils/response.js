const ok = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, message, data = null) =>
  res.status(201).json({ success: true, message, data });

const error = (res, message, statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { ok, created, error };
