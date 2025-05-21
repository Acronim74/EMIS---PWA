const API_URL = 'http://localhost:5000';

export async function fetchForms() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/forms`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки анкет');
  return data;
}

export async function fetchForm(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/forms/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки анкеты');
  return data;
}

export async function submitAnswers(formId, answers) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/forms/${formId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки ответов');
  return data;
}

export async function fetchProgress() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки прогресса');
  return data;
}

export async function fetchMyAnswers(formId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/my-answers/${formId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки ответов');
  return data;
}
export async function createForm({ title, description, order }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/admin/forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, order })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка создания анкеты');
  return data;
}
export async function createQuestion(formId, questionData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/admin/forms/${formId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ questions: [questionData] }) // отправляем в массиве
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка при создании вопроса');
  return data;
}

