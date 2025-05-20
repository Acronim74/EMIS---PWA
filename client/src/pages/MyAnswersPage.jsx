import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchForm, fetchMyAnswers } from '../api/forms';

export default function MyAnswersPage() {
  const { id } = useParams(); // form_id из URL
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const formData = await fetchForm(id);
        setForm(formData.form);
        const answerData = await fetchMyAnswers(id);
        console.log('Ответы:', answerData);
        setAnswers(Array.isArray(answerData.answers) ? answerData.answers : []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);
  

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Ошибка загрузки: {error}
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-4">Загрузка анкеты...</div>
    );
  }

  // Сопоставление вопросов и ответов
  const answerMap = answers.reduce((acc, a) => {
    acc[a.question_id] = a.answer;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">
        Ваши ответы на анкету: {form.title}
      </h1>

      <ul className="space-y-6">
        {form.questions?.map((q, idx) => (
          <li key={q.id} className="border p-4 rounded shadow bg-white">
            <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
            <div className="text-gray-800">
              {formatAnswer(answerMap[q.id])}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          to="/progress"
          className="text-blue-600 hover:underline"
        >
          ← Вернуться к списку анкет
        </Link>
      </div>
    </div>
  );
}

// Универсальный форматтер
function formatAnswer(raw) {
  if (!raw) return <span className="text-gray-400">Нет ответа</span>;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.join(', ');
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}
  