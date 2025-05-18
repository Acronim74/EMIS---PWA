import { useEffect, useState } from 'react';
import { fetchForms } from '../api/forms';
import { Link } from 'react-router-dom';

export default function FormListPage() {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchForms();
        setForms(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Доступные анкеты</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <ul className="space-y-4">
        {forms.map(form => (
          <li key={form.id} className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">{form.title}</h2>
            <p className="text-gray-600 whitespace-pre-line">{form.description}</p>
            <Link
              to={`/forms/${form.id}`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Перейти к анкете →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
