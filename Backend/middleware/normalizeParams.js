exports.normalizeParams = (req, res, next) => {
  const keys = new Set();
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      return res.status(400).json({ message: `Duplicate query param: ${key}` });
    }
    keys.add(key);
  }
  next();
};
