const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  console.log('Заголовки запроса:', req.headers);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен отсутствует или некорректен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // добавляем пользователя в запрос
    next();
  } catch (err) {
    console.error('Ошибка JWT:', err.message);
    res.status(403).json({ error: 'Недействительный токен' });
  }
}

module.exports = authMiddleware;
