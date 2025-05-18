import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Страницы (pages)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FormListPage from './pages/FormListPage';
import FormPage from './pages/FormPage';
import ProgressPage from './pages/ProgressPage';
import MyAnswersPage from './pages/MyAnswersPage';
import AdminPage from './pages/AdminPage';

// Компонент защиты маршрутов
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищённые маршруты — только авторизованные пользователи */}
          <Route
            path="/forms"
            element={
              <PrivateRoute>
                <FormListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/forms/:id"
            element={
              <PrivateRoute>
                <FormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <ProgressPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-answers/:id"
            element={
              <PrivateRoute>
                <MyAnswersPage />
              </PrivateRoute>
            }
          />

          {/* Только для админа */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminPage />
              </PrivateRoute>
            }
          />

          {/* Любой другой путь — редирект на вход */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

