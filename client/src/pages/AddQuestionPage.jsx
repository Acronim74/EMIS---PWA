import { useEffect, useState } from 'react';
import { fetchForms, createQuestion } from '../api/forms';
import { useNavigate } from 'react-router-dom';

export default function AddQuestionPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [questionData, setQuestionData] = useState({
    question: '',
    type: 'text',
    options: '',
    order: 0
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await fetchForms();
        setForms(Array.isArray(data.forms) ? data.forms : []);
      } catch (err) {
        setError(err.message);
      }
    };
    loadForms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedFormId) {
      setError('Выберите анкету');
      return;
    }

    try {
      const payload = {
        ...questionData,
        options: ['radio', 'checkbox'].includes(questionData.type)
          ? questionData.options.split(',').map(opt => opt.trim())
          : null
      };
      await createQuestion(selectedFormId, payload);
      setMessage('Вопрос успешно добавлен');
      setQuestionData({ question: '', type: 'text', options: '', order: 0 });
    } catch (err) {
      setError(err.message || 'Ошибка при добавлении вопроса');
    }
  };

  const selectedForm = forms.find(f => f.id === selectedFormId);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Добавить вопрос к анкете</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Выберите анкету:</label>
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">-- выбрать --</option>
          {forms.map(form => (
            <option key={form.id} value={form.id}>
              {form.title}
            </option>
          ))}
        </select>
      </div>

      {selectedForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div>
            <label className="block font-medium">Текст вопроса</label>
            <input
              type="text"
              name="question"
              value={questionData.question}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Тип вопроса</label>
            <select
              name="type"
              value={questionData.type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="text">Короткий текст</option>
              <option value="textarea">Развёрнутый текст</option>
              <option value="radio">Один из вариантов</option>
              <option value="checkbox">Несколько вариантов</option>
              <option value="scale">Шкала (0–10)</option>
            </select>
          </div>

          {['radio', 'checkbox'].includes(questionData.type) && (
            <div>
              <label className="block font-medium">Варианты ответа (через запятую)</label>
              <input
                type="text"
                name="options"
                value={questionData.options}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          )}

          <div>
            <label className="block font-medium">Порядок</label>
            <input
              type="number"
              name="order"
              value={questionData.order}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Добавить вопрос
          </button>

          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <button
            type="button"
            onClick={() => navigate(`/forms/${selectedFormId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Просмотреть анкету →
          </button>
        </form>
      )}
    </div>
  );
}
