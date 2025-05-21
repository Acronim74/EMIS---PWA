import { useEffect, useState } from 'react';
import { fetchForms, createForm } from '../api/forms';

export default function AdminPage() {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [successMessage, setSuccessMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
if (user.role !== 'admin') {
  return (
    <div className="p-4 text-red-600">
      Доступ запрещён: только для администратора
    </div>
  );
}
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchForms();
        setForms(Array.isArray(data.forms) ? data.forms : []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const created = await createForm(formData);
      setSuccessMessage(`Анкета создана: ${created.id}`);
      setForms(prev => [...prev, created]);
      setFormData({ title: '', description: '', order: 0 });
    } catch (err) {
      setError(err.message || 'Ошибка создания анкеты');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Админ-панель</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block font-medium">Название анкеты</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block font-medium">Порядок отображения (order)</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Создать анкету
        </button>

        {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Существующие анкеты</h2>
      <ul className="space-y-3">
        {forms.map(form => (
         <li key={form.id} className="border p-3 rounded bg-white shadow">
         <strong>{form.title}</strong> (ID: {form.id})
         <p className="text-sm text-gray-600 whitespace-pre-line mb-2">{form.description}</p>
         <a
           href={`/forms/${form.id}`}
           className="inline-block text-blue-600 hover:underline"
         >
           Перейти к анкете →
         </a>
       </li>
       
        ))}
      </ul>
    </div>
  );
}
 