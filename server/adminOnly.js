function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    next();
  }
  
  module.exports = adminOnly;
  