import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchForm, submitAnswers } from '../api/forms';

export default function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await fetchForm(id);
        setForm(data.form);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message);
      }
    };
    loadForm();
  }, [id]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        question_id: questionId,
        value: Array.isArray(value) ? JSON.stringify(value) : value
      }));

      await submitAnswers(id, formattedAnswers);
      setSuccess('Ответы успешно отправлены!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!form) return <div className="p-4">Загрузка анкеты...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      <p className="text-gray-700 whitespace-pre-line mb-6">{form.description}</p>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.length > 0 ? (
          questions.map(q => (
            <div key={q.id}>
              <label className="block font-semibold mb-1">{q.question}</label>

              {q.type === 'text' && (
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.type === 'single' && (
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  <option value="">Выберите вариант</option>
                  {q.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === 'multi' && (
                <div className="space-y-1">
                  {q.options?.map(opt => (
                    <label key={opt} className="block">
                      <input
                        type="checkbox"
                        value={opt}
                        onChange={(e) => {
                          const selected = answers[q.id] || [];
                          handleChange(q.id, e.target.checked
                            ? [...selected, opt]
                            : selected.filter(o => o !== opt)
                          );
                        }}
                      />
                      <span className="ml-2">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Вопросов пока нет.</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
