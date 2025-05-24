import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupData, setGroupData] = useState({ title: '', description: '' });

  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    short_desc: '',
    full_desc: '',
    goal: '',
    reward: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch('http://localhost:5000/admin/groups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const text = await res.text();
        const json = JSON.parse(text);

        if (!res.ok) throw new Error(json.error || 'Ошибка загрузки групп');

        setGroups(json.groups || []);
      } catch (err) {
        setError('Ошибка загрузки групп: ' + err.message);
      }
    };

    loadGroups();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedFormId('');
    setMessage('');
    setError('');

    const group = groups.find(g => g.id === groupId);
    setGroupData({ title: group.title, description: group.description || '' });

    try {
      const res = await fetch(`http://localhost:5000/forms?group_id=${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки анкет');

      setForms(json.forms || []);
    } catch (err) {
      setError('Ошибка загрузки анкет: ' + err.message);
    }
  };

  const handleFormSelect = (formId) => {
    setSelectedFormId(formId);
    setMessage('');
    setError('');

    const form = forms.find(f => f.id === formId);
    if (form) {
      setFormData({
        title: form.title,
        short_desc: form.short_desc || '',
        full_desc: form.full_desc || '',
        goal: form.goal || '',
        reward: form.reward || ''
      });
    }
  };

  const updateGroup = async () => {
    try {
      const res = await fetch(`http://localhost:5000/admin/groups/${selectedGroupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(groupData)
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!res.ok) throw new Error(json.error || 'Ошибка обновления группы');

      setMessage('Группа успешно обновлена');
    } catch (err) {
      setError('Ошибка обновления группы: ' + err.message);
    }
  };

  const updateForm = async () => {
    try {
      const res = await fetch(`http://localhost:5000/admin/forms/${selectedFormId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!res.ok) throw new Error(json.error || 'Ошибка обновления анкеты');

      setMessage('Анкета успешно обновлена');
    } catch (err) {
      setError('Ошибка обновления анкеты: ' + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Редактировать группу или анкету</h1>

      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Выберите группу</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedGroupId}
            onChange={(e) => handleGroupSelect(e.target.value)}
          >
            <option value="">-- не выбрана --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        {selectedGroupId && (
          <div className="space-y-3 border-t pt-4">
            <h2 className="font-semibold">Редактировать группу</h2>
            <input
              className="w-full p-2 border rounded"
              placeholder="Название группы"
              value={groupData.title}
              onChange={(e) => setGroupData(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Описание"
              value={groupData.description}
              onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
            />
            <button
              onClick={updateGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Сохранить группу
            </button>
          </div>
        )}

        {forms.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <label className="block font-semibold mb-1">Выберите анкету</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedFormId}
              onChange={(e) => handleFormSelect(e.target.value)}
            >
              <option value="">-- не выбрана --</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
        )}

        {selectedFormId && (
          <div className="space-y-3 border-t pt-4">
            <h2 className="font-semibold">Редактировать анкету</h2>
            <input
              className="w-full p-2 border rounded"
              placeholder="Название анкеты"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Краткое описание"
              value={formData.short_desc}
              onChange={(e) => setFormData(prev => ({ ...prev, short_desc: e.target.value }))}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Полное описание"
              value={formData.full_desc}
              onChange={(e) => setFormData(prev => ({ ...prev, full_desc: e.target.value }))}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Цель анкеты"
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Результат прохождения"
              value={formData.reward}
              onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
            />
            <button
              onClick={updateForm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Сохранить анкету
            </button>
          </div>
        )}

        {message && <div className="text-green-600 mt-4">{message}</div>}
        {error && <div className="text-red-600 mt-4">{error}</div>}

        <div className="mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:underline"
          >
            ← Назад
          </button>
        </div>
      </div>
    </div>
  );
}
