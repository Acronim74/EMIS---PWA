import { useEffect, useState } from 'react';
import { fetchProgress } from '../api/forms';

export default function ProgressPage() {
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProgress();
        setCompleted(data.progress || []); // ← Важно: берем data.progress
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);
  {Array.isArray(completed) && completed.length > 0 ? (
    <ul className="space-y-4">
      {completed.map(form => (
        <li key={form.id} className="border p-4 rounded shadow bg-white">
          <h2 className="text-lg font-semibold">{form.title}</h2>
          <p className="text-gray-600 whitespace-pre-line">{form.description}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500">Вы пока не прошли ни одной анкеты.</p>
  )}
  
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Ваш прогресс</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
  
      {completed.length === 0 ? (
        <p className="text-gray-500">Вы пока не прошли ни одной анкеты.</p>
      ) : (
        <ul className="space-y-4">
          {completed.map(form => (
            <li key={form.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-lg font-semibold">{form.title}</h2>
              <p className="text-gray-600 whitespace-pre-line">{form.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  {console.log('Текущий прогресс:', completed)}
  
}
