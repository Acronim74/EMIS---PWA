import NavigationMenu from "../components/NavigationMenu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function HomePage() {
  const [user, setUser] = useState(null);

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
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">
        Добро пожаловать{user ? `, ${user.email}` : ""}!
      </h1>
      <p className="mb-4 text-sm text-gray-600">
        Выберите, куда двигаться дальше:
      </p>

      <NavigationMenu onLogout={handleLogout} />
    </div>
  );
}
