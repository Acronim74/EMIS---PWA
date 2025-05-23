import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationMenu from "../components/NavigationMenu";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [incompleteFormId, setIncompleteFormId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch {
        console.error("Ошибка разбора user");
      }
    }

    // Загрузка незавершённых анкет с сервера
    const loadDrafts = async () => {
      try {
        const res = await fetch("http://localhost:5000/incomplete", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (res.ok && json.forms.length > 0) {
          setIncompleteFormId(json.forms[0].form_id);
        }
      } catch (err) {
        console.error("Ошибка загрузки черновиков", err);
      }
    };

    loadDrafts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">
        Добро пожаловать{user ? `, ${user.email}` : ""}!
      </h1>
      <p className="mb-4 text-sm text-gray-600">
        Выберите, куда двигаться дальше:
      </p>

      {incompleteFormId && (
        <div className="mb-4">
          <button
            onClick={() => navigate(`/forms/${incompleteFormId}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Продолжить незавершённую анкету
          </button>
        </div>
      )}

      <NavigationMenu onLogout={handleLogout} />
    </div>
  );
}
