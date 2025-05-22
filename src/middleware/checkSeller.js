exports.checkAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

exports.checkSeller = (req, res, next) => {
  if (req.user?.role !== 'seller')
    return res.status(403).json({ error: 'Only sellers allowed' });
  next();
};
