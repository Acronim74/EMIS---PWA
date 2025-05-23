// components/NavigationMenu.jsx
import { ClipboardList, BarChart, Brain, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NavigationMenu({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 p-4">
      <Link to="/forms" className="flex flex-col items-center p-3 bg-white rounded-2xl shadow hover:shadow-md">
        <ClipboardList className="h-6 w-6" />
        <span className="mt-1 text-sm">Анкеты</span>
      </Link>

      <Link to="/progress" className="flex flex-col items-center p-3 bg-white rounded-2xl shadow hover:shadow-md">
        <BarChart className="h-6 w-6" />
        <span className="mt-1 text-sm">Прогресс</span>
      </Link>

      <Link to="/my-answers" className="flex flex-col items-center p-3 bg-white rounded-2xl shadow hover:shadow-md">
        <Brain className="h-6 w-6" />
        <span className="mt-1 text-sm">Анализ</span>
      </Link>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          window.location.reload(); // принудительно обновляет, чтобы обнулить состояние
        }}
        className="flex flex-col items-center p-3 bg-white rounded-2xl shadow hover:shadow-md">
        <LogOut className="h-6 w-6" />
        <span className="mt-1 text-sm">Выйти</span>
      </button>

    </div>
  );
}
