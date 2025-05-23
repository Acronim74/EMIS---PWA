import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FormListPage() {
  const [groups, setGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [formsByGroup, setFormsByGroup] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch('http://localhost:5000/admin/groups', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const json = await res.json();
        if (res.ok) {
          setGroups(json.groups || []);
        } else {
          throw new Error(json.error || 'Ошибка загрузки групп');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadGroups();
  }, []);

  const toggleGroup = async (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }

    if (!formsByGroup[groupId]) {
      try {
        const res = await fetch(`http://localhost:5000/forms?group_id=${groupId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const json = await res.json();
        if (res.ok) {
          setFormsByGroup(prev => ({ ...prev, [groupId]: json.forms }));
        } else {
          throw new Error(json.error || 'Ошибка загрузки анкет');
        }
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    setExpandedGroup(groupId);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Доступные анкеты</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {groups.length === 0 ? (
        <p className="text-gray-500">Пока нет доступных групп анкет.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map(group => (
            <li key={group.id} className="border p-4 rounded shadow bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{group.title}</h2>
                  <p className="text-gray-600">{group.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Анкет в группе: {group.form_count}
                  </p>
                </div>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="text-blue-600 hover:underline"
                >
                  {expandedGroup === group.id ? 'Скрыть' : 'Подробнее'}
                </button>
              </div>

              {expandedGroup === group.id && (
                <ul className="mt-4 space-y-3">
                  {(formsByGroup[group.id] || []).map(form => (
                    <li key={form.id} className="border p-3 rounded bg-gray-50">
                      <h3 className="font-semibold">{form.title}</h3>
                      <p className="text-sm text-gray-600">{form.short_desc}</p>
                      <button
                        onClick={() => navigate(`/forms/${form.id}`)}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Перейти к анкете →
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
