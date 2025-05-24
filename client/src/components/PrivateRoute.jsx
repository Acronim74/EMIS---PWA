import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  let user = {};
  try {
    user = userJson ? JSON.parse(userJson) : {};
  } catch (err) {
    console.error('Ошибка разбора user из localStorage:', err);
    user = {};
  }

  if (!token || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
