// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// страницы
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import HomePage         from './pages/HomePage';      // ← новое имя файла
import FormListPage     from './pages/FormListPage';
import FormPage         from './pages/FormPage';
import ProgressPage     from './pages/ProgressPage';
import MyAnswersPage    from './pages/MyAnswersPage';
import AdminPage        from './pages/AdminPage';
import AddQuestionPage  from './pages/AddQuestionPage';
import CreateGroupPage  from './pages/CreateGroupPage';
import CreateFormPage   from './pages/CreateFormPage';
import EditPage         from './pages/EditPage';
import DeletePage       from './pages/DeletePage';


// компонент-охранник
import PrivateRoute     from './components/PrivateRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* общедоступные маршруты */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* редирект с корня */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* защищённые маршруты (роль не проверяем) */}
        <Route path="/home"            element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/forms"           element={<PrivateRoute><FormListPage /></PrivateRoute>} />
        <Route path="/forms/:id"       element={<PrivateRoute><FormPage /></PrivateRoute>} />
        <Route path="/progress"        element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
        <Route path="/my-answers/:id"  element={<PrivateRoute><MyAnswersPage /></PrivateRoute>} />

        {/* защищённые маршруты администратора */}
        <Route path="/admin"                    element={<PrivateRoute requiredRole="admin"><AdminPage /></PrivateRoute>} />
        <Route path="/admin/add-question"       element={<PrivateRoute requiredRole="admin"><AddQuestionPage /></PrivateRoute>} />
        <Route path="/admin/groups/create"      element={<PrivateRoute requiredRole="admin"><CreateGroupPage /></PrivateRoute>}/>
        <Route path="/admin/forms/create"       element={<PrivateRoute requiredRole="admin"><CreateFormPage /></PrivateRoute>}/>
        <Route path="/admin/edit"               element={<PrivateRoute requiredRole="admin"><EditPage /></PrivateRoute>}/>
        <Route path="/admin/delete"             element={<PrivateRoute requiredRole="admin"><DeletePage /></PrivateRoute>}/>


        {/* запасной маршрут */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
