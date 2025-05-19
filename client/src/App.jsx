import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FormListPage from './pages/FormListPage';
import FormPage from './pages/FormPage';
import ProgressPage from './pages/ProgressPage';
import MyAnswersPage from './pages/MyAnswersPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forms" element={<FormListPage />} />
        <Route path="/forms/:id" element={<FormPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/my-answers/:id" element={<MyAnswersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
