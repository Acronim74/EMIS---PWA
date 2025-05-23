import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchForm, submitAnswers } from '../api/forms';

export default function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState('step'); // step | review | done
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadFormAndProgress = async () => {
      try {
        const data = await fetchForm(id);
        setForm(data.form);
        setQuestions(data.questions || []);

        const res = await fetch(`http://localhost:5000/progress/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();
        if (res.ok) {
          setCurrentIndex(json.last_question_index || 0);
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки анкеты или прогресса');
      }
    };

    loadFormAndProgress();
  }, [id]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentIndex];
    const answer = answers[currentQuestion.id];

    if (currentQuestion.is_required && !answer) {
      setError('Этот вопрос обязателен для заполнения');
      return;
    }

    setError('');
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveProgress(nextIndex);
    } else {
      setMode('review');
    }
  };

  const saveProgress = async (index) => {
    try {
      await fetch(`http://localhost:5000/progress/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          last_question_index: index,
          completed: false
        })
      });
    } catch (err) {
      console.error('Ошибка сохранения прогресса', err);
    }
  };

  const handleBackToQuestion = () => {
    setMode('step');
    setCurrentIndex(0);
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        question_id: questionId,
        answer: Array.isArray(value) ? JSON.stringify(value) : value
      }));

      await submitAnswers(id, formattedAnswers);

      await fetch(`http://localhost:5000/incomplete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      await fetch(`http://localhost:5000/progress/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          last_question_index: questions.length,
          completed: true
        })
      });

      setMode('done');
      setSuccess('Ответы успешно отправлены!');
    } catch (err) {
      setError(err.message || 'Ошибка отправки');
    }
  };

  if (!form) return <div className="p-4">Загрузка анкеты...</div>;

  if (mode === 'done') {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Анкета пройдена</h1>
        <p className="text-green-600">{success}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      <p className="text-gray-600 mb-4 whitespace-pre-line">{form.full_desc}</p>

      {mode === 'step' && questions.length > 0 && (
        <>
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {questions[currentIndex].question}
              {questions[currentIndex].is_required && <span className="text-red-600 ml-1">*</span>}
            </label>

            {renderInput(questions[currentIndex], answers[questions[currentIndex].id] || '', handleChange)}
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {currentIndex < questions.length - 1 ? 'Далее' : 'Проверить ответы'}
          </button>
        </>
      )}

      {mode === 'review' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Проверьте ваши ответы:</h2>
          <ul className="space-y-3">
            {questions.map(q => (
              <li key={q.id} className="border p-3 rounded bg-white shadow">
                <p className="font-semibold">{q.question}</p>
                <p className="text-gray-800">{formatAnswer(answers[q.id])}</p>
              </li>
            ))}
          </ul>

          {error && <div className="text-red-600 mt-4">{error}</div>}

          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleBackToQuestion}
              className="text-sm text-blue-600 underline"
            >
              Назад к вопросам
            </button>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Отправить анкету
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderInput(q, value, onChange) {
  const id = q.id;
  if (q.type === 'text') {
    return (
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
    );
  }

  if (q.type === 'single') {
    return (
      <select
        className="w-full p-2 border rounded"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">Выберите вариант</option>
        {q.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (q.type === 'multi') {
    return (
      <div className="space-y-1">
        {q.options?.map(opt => (
          <label key={opt} className="block">
            <input
              type="checkbox"
              checked={value?.includes(opt) || false}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...(value || []), opt]
                  : (value || []).filter(v => v !== opt);
                onChange(id, updated);
              }}
            />
            <span className="ml-2">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  return null;
}

function formatAnswer(raw) {
  if (!raw) return <span className="text-gray-400">Нет ответа</span>;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return parsed.toString();
  } catch {
    return raw;
  }
}
