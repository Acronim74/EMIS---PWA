import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeletePage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchGroups = async () => {
    try {
      const res = await fetch('http://localhost:5000/admin/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setGroups(json.groups);
    } catch (err) {
      setError('Ошибка загрузки групп: ' + err.message);
    }
  };

  const fetchForms = async (groupId) => {
    try {
      const res = await fetch(`http://localhost:5000/forms?group_id=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setForms(json.forms);
    } catch (err) {
      setError('Ошибка загрузки анкет: ' + err.message);
    }
  };

  const fetchQuestions = async (formId) => {
    try {
      const res = await fetch(`http://localhost:5000/forms/${formId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuestions(json.questions);
    } catch (err) {
      setError('Ошибка загрузки вопросов: ' + err.message);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;
    if (!window.confirm('Удалить эту группу со всеми анкетами?')) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/groups/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка при удалении группы');
      setMessage('Группа удалена');
      setSelectedGroup(null);
      setForms([]);
      setQuestions([]);
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteForm = async () => {
    if (!selectedForm) return;
    if (!window.confirm('Удалить эту анкету со всеми вопросами?')) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/forms/${selectedForm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка при удалении анкеты');
      setMessage('Анкета удалена');
      setSelectedForm(null);
      setQuestions([]);
      fetchForms(selectedGroup.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteQuestion = async () => {
    if (!selectedQuestion) return;
    if (!window.confirm('Удалить этот вопрос?')) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/questions/${selectedQuestion.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка при удалении вопроса');
      setMessage('Вопрос удалён');
      setSelectedQuestion(null);
      fetchQuestions(selectedForm.id);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Удаление групп, анкет и вопросов</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {message && <div className="text-green-600 mb-4">{message}</div>}

      <div className="space-y-4">
        {/* Выбор группы */}
        <div>
          <label className="font-semibold">Группа</label>
          <select
            className="w-full p-2 border rounded mt-1"
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const group = groups.find(g => g.id === e.target.value);
              setSelectedGroup(group);
              setSelectedForm(null);
              setSelectedQuestion(null);
              setForms([]);
              setQuestions([]);
              if (group) fetchForms(group.id);
            }}
          >
            <option value="">-- выбрать --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          {selectedGroup && (
            <button onClick={deleteGroup} className="text-red-600 mt-2 block">
              🗑 Удалить группу
            </button>
          )}
        </div>

        {/* Выбор анкеты */}
        {forms.length > 0 && (
          <div>
            <label className="font-semibold">Анкета</label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={selectedForm?.id || ''}
              onChange={(e) => {
                const form = forms.find(f => f.id === e.target.value);
                setSelectedForm(form);
                setSelectedQuestion(null);
                setQuestions([]);
                if (form) fetchQuestions(form.id);
              }}
            >
              <option value="">-- выбрать --</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
            {selectedForm && (
              <button onClick={deleteForm} className="text-red-600 mt-2 block">
                🗑 Удалить анкету
              </button>
            )}
          </div>
        )}

        {/* Выбор вопроса */}
        {questions.length > 0 && (
          <div>
            <label className="font-semibold">Вопрос</label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={selectedQuestion?.id || ''}
              onChange={(e) => {
                const q = questions.find(q => q.id === e.target.value);
                setSelectedQuestion(q);
              }}
            >
              <option value="">-- выбрать --</option>
              {questions.map(q => (
                <option key={q.id} value={q.id}>{q.question}</option>
              ))}
            </select>
            {selectedQuestion && (
              <button onClick={deleteQuestion} className="text-red-600 mt-2 block">
                🗑 Удалить вопрос
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:underline"
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}
