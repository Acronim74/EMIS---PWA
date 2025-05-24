import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateFormPage() {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [reward, setReward] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch('http://localhost:5000/admin/groups', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const text = await res.text();
        const json = JSON.parse(text);

        if (!res.ok) throw new Error(json.error || 'Ошибка загрузки групп');
        setGroups(json.groups || []);
      } catch (err) {
        setError('Ошибка при загрузке групп: ' + err.message);
      }
    };

    loadGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!groupId || !title.trim()) {
      setError('Выберите группу и укажите название анкеты');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/admin/groups/${groupId}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          short_desc: shortDesc,
          full_desc: fullDesc,
          goal,
          reward
        })
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!res.ok) throw new Error(json.error || 'Ошибка при создании анкеты');

      setSuccess('Анкета успешно создана');
      setTitle('');
      setShortDesc('');
      setFullDesc('');
      setGoal('');
      setReward('');
    } catch (err) {
      setError('Ошибка при сохранении анкеты: ' + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Создать анкету</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Группа</label>
          <select
            className="w-full p-2 border rounded"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Выберите группу</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Название анкеты</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Краткое описание</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Полное описание</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Цель анкеты</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Результат после прохождения</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:underline"
          >
            ← Назад
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}
