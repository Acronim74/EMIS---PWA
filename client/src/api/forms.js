const API_BASE = 'http://localhost:5000';

export async function fetchForms() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/forms`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка загрузки форм');

  return data.forms;
}

export async function fetchForm(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/forms/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка загрузки анкеты');
  return data;
}

export async function submitAnswers(formId, answers) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/forms/${formId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка отправки');
  return data;
}
export async function fetchProgress() {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/progress`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка загрузки прогресса');
  return data.progress;
}

