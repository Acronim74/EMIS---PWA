const auth = require('./auth');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Регистрация пользователя
app.post('/register', async (req, res) => {
  console.log('Пришло в req.body:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставляем пользователя в Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, role: 'user' }])
      .select();

    console.log('Ответ Supabase (register):', { data, error });

    if (error || !data || !data[0]) {
      return res.status(400).json({ error: error?.message || 'Ошибка при регистрации' });
    }

    res.status(200).json({
      message: 'Пользователь зарегистрирован',
      user: data[0]
    });
  } catch (err) {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// ✅ Авторизация пользователя
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    // Поиск пользователя по email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Ответ Supabase (login):', { data, error });

    if (error || !data) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сравниваем пароль
    const valid = await bcrypt.compare(password, data.password);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерация токена
    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Вход выполнен',
      token,
      user: {
        id: data.id,
        email: data.email,
        role: data.role
      }
    });
  } catch (err) {
    console.error('Ошибка сервера при логине:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Маршрут /me
app.get('/me', auth, async (req, res) => {
  const { id } = req.user;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  res.json({ user: data });
});

app.get('/forms', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('forms')
    .select('id, title, description, order')
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) {
    console.error('Ошибка при получении форм:', error);
    return res.status(500).json({ error: 'Ошибка при получении анкет' });
  }

  res.json({ forms: data });
});

app.get('/forms/:id', auth, async (req, res) => {
  const formId = req.params.id;

  // Получаем саму анкету
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, title, description, order')
    .eq('id', formId)
    .single();

  if (formError || !form) {
    return res.status(404).json({ error: 'Анкета не найдена' });
  }

  // Получаем вопросы к анкете
  const { data: questions, error: questionError } = await supabase
    .from('questions')
    .select('id, type, question, options, order')
    .eq('form_id', formId)
    .order('order', { ascending: true });

  if (questionError) {
    return res.status(500).json({ error: 'Ошибка при получении вопросов' });
  }

  res.json({
    form,
    questions
  });
});
// Сохраняет ответы пользователя
app.post('/forms/:id/submit', auth, async (req, res) => {
  const formId = req.params.id;
  const userId = req.user.id;
  const answers = req.body.answers;

  // 🔍 Проверка: есть ли уже ответы?
  const { data: existingAnswers, error: checkError } = await supabase
    .from('answers')
    .select('id')
    .eq('user_id', userId)
    .eq('form_id', formId)
    .limit(1);

  if (checkError) {
    console.error('Ошибка при проверке ответов:', checkError);
    return res.status(500).json({ error: 'Ошибка при проверке' });
  }

  if (existingAnswers && existingAnswers.length > 0) {
    return res.status(409).json({ error: 'Вы уже прошли эту анкету' });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Список ответов пуст или отсутствует' });
  }

  const prepared = answers.map((a) => ({
    user_id: userId,
    form_id: formId,
    question_id: a.question_id,
    answer: a.answer
  }));

  const { data, error } = await supabase
    .from('answers')
    .insert(prepared)
    .select();

  if (error) {
    console.error('Ошибка при сохранении ответов:', error);
    return res.status(500).json({ error: 'Не удалось сохранить ответы' });
  }

  res.status(200).json({ message: 'Ответы сохранены', count: data.length });
});

app.get('/progress', auth, async (req, res) => {
  const userId = req.user.id;

  // Получаем все form_id, по которым есть ответы
  const { data: rawAnswers, error: answerError } = await supabase
    .from('answers')
    .select('form_id')
    .eq('user_id', userId);

  if (answerError) {
    return res.status(500).json({ error: 'Ошибка при получении прогресса' });
  }

  // Удаляем дубликаты form_id
  const formIds = [...new Set(rawAnswers.map(a => a.form_id))];

  if (formIds.length === 0) {
    return res.json({ progress: [] });
  }

  // Загружаем анкеты по этим ID
  const { data: forms, error: formError } = await supabase
    .from('forms')
    .select('id, title, description')
    .in('id', formIds);

  if (formError) {
    return res.status(500).json({ error: 'Ошибка при загрузке анкет' });
  }

  res.json({ progress: forms });
});


app.get('/my-answers/:form_id', auth, async (req, res) => {
  const formId = req.params.form_id;
  const userId = req.user.id;

  // Получаем ответы пользователя по этой анкете
  const { data: answers, error } = await supabase
    .from('answers')
    .select('question_id, answer, created_at')
    .eq('user_id', userId)
    .eq('form_id', formId);

  if (error) {
    console.error('Ошибка при получении личных ответов:', error);
    return res.status(500).json({ error: 'Не удалось загрузить ответы' });
  }

  // Загружаем вопросы
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, question')
    .eq('form_id', formId);

  if (qError) {
    console.error('Ошибка при загрузке вопросов:', qError);
    return res.status(500).json({ error: 'Не удалось загрузить вопросы' });
  }

  // Преобразуем к читаемому виду
  const questionMap = {};
  for (const q of questions) {
    questionMap[q.id] = q.question;
  }

  const structured = answers.map(a => ({
    question: questionMap[a.question_id] || '[не найдено]',
    answer: a.answer,
    at: a.created_at
  }));

  res.json({ answers: structured });
});

const adminOnly = require('./adminOnly');

app.post('/admin/forms', auth, adminOnly, async (req, res) => {
  const { title, description, order = 0 } = req.body;

  const { data, error } = await supabase
    .from('forms')
    .insert([{ title, description, order, is_active: true }])
    .select();

  if (error) {
    console.error('Ошибка при создании формы:', error);
    return res.status(500).json({ error: 'Не удалось создать форму' });
  }

  res.status(200).json({ message: 'Форма создана', form: data[0] });
});

app.post('/admin/forms/:id/questions', auth, adminOnly, async (req, res) => {
  const formId = req.params.id;
  const input = req.body;
  const questions = Array.isArray(input.questions)
    ? input.questions
    : [input];
  
  if (!questions.length || !questions[0].question) {
    return res.status(400).json({ error: 'Нет валидных вопросов' });
  }
  

  const toInsert = questions.map((q, i) => ({
    form_id: formId,
    type: q.type,
    question: q.question,
    options: q.options || [],
    order: q.order ?? i
  }));

  const { data, error } = await supabase
    .from('questions')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('Ошибка при добавлении вопросов:', error);
    return res.status(500).json({ error: 'Не удалось добавить вопросы' });
  }

  res.status(200).json({ message: 'Вопросы добавлены', count: data.length });
});

app.get('/admin/users-progress', auth, adminOnly, async (req, res) => {
  // Загружаем все ответы всех пользователей
  const { data: answers, error } = await supabase
    .from('answers')
    .select('user_id, form_id, created_at');

  if (error) {
    console.error('Ошибка при получении прогресса:', error);
    return res.status(500).json({ error: 'Не удалось получить данные' });
  }

  // Группируем по user_id + form_id
  const progressMap = {};

  for (const ans of answers) {
    const key = `${ans.user_id}_${ans.form_id}`;

    if (!progressMap[key]) {
      progressMap[key] = {
        user_id: ans.user_id,
        form_id: ans.form_id,
        count: 1,
        first_answer: ans.created_at
      };
    } else {
      progressMap[key].count += 1;
      if (ans.created_at < progressMap[key].first_answer) {
        progressMap[key].first_answer = ans.created_at;
      }
    }
  }

  const progressList = Object.values(progressMap);

  // Подгружаем пользователей
  const userIds = [...new Set(progressList.map(p => p.user_id))];
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds);

  // Подгружаем формы
  const formIds = [...new Set(progressList.map(p => p.form_id))];
  const { data: forms } = await supabase
    .from('forms')
    .select('id, title')
    .in('id', formIds);

  // Собираем финальный список
  const result = progressList.map(p => ({
    user_id: p.user_id,
    email: users.find(u => u.id === p.user_id)?.email || '[неизвестно]',
    form_id: p.form_id,
    form_title: forms.find(f => f.id === p.form_id)?.title || '[неизвестно]',
    answers_count: p.count,
    first_answer_at: p.first_answer
  }));

  res.json({ progress: result });
});

app.post('/forms/:id/submit', auth, async (req, res) => {
  const formId = req.params.id;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Неверный формат данных' });
  }

  const userId = req.user.id;

  // Проверка — уже проходил?
  const { data: existing } = await supabase
    .from('answers')
    .select('id')
    .eq('form_id', formId)
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(400).json({ error: 'Вы уже прошли эту анкету' });
  }

  const answersWithUser = answers.map(answer => ({
    ...answer,
    user_id: userId,
    form_id: formId
  }));

  const { data, error } = await supabase
    .from('answers')
    .insert(answersWithUser);

  if (error) {
    return res.status(500).json({ error: 'Ошибка при сохранении ответов' });
  }

  res.json({ message: 'Ответы сохранены', data });
});

app.get('/incomplete/:form_id', auth, async (req, res) => {
  const { form_id } = req.params;
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('incomplete_answers')
      .select('answers')
      .eq('user_id', user_id)
      .eq('form_id', form_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // если не просто "ничего не найдено"
    res.json({ answers: data?.answers || {} });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении черновика' });
  }
});

app.post('/incomplete/:form_id', auth, async (req, res) => {
  const { form_id } = req.params;
  const user_id = req.user.id;
  const answers = req.body.answers;

  try {
    const { data, error } = await supabase
      .from('incomplete_answers')
      .upsert([{ user_id, form_id, answers }], { onConflict: ['user_id', 'form_id'] });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при сохранении черновика' });
  }
});

app.delete('/incomplete/:form_id', auth, async (req, res) => {
  const { form_id } = req.params;
  const user_id = req.user.id;

  try {
    const { error } = await supabase
      .from('incomplete_answers')
      .delete()
      .eq('user_id', user_id)
      .eq('form_id', form_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении черновика' });
  }
});

// получить все незавершённые анкеты пользователя
app.get('/incomplete', auth, async (req, res) => {
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('incomplete_answers')
      .select('form_id')
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ forms: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении незавершённых анкет' });
  }
});
app.post('/admin/groups', auth, adminOnly, async (req, res) => {
  const { title, description } = req.body;

  try {
    const { data, error } = await supabase
      .from('form_groups')
      .insert([{ title, description }])
      .select()
      .single();

    if (error) throw error;
    res.json({ group: data });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания группы' });
  }
});
app.get('/admin/groups', auth, adminOnly, async (req, res) => {
  try {
    const { data: groups, error } = await supabase
      .from('form_groups')
      .select('id, title, description');

    if (error) throw error;

    const { data: counts, error: countErr } = await supabase
      .from('forms')
      .select('group_id, count(*)', { count: 'exact' })
      .group('group_id');

    if (countErr) throw countErr;

    const countsMap = {};
    counts.forEach(c => {
      countsMap[c.group_id] = c.count;
    });

    const result = groups.map(g => ({
      ...g,
      form_count: countsMap[g.id] || 0
    }));

    res.json({ groups: result });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения групп' });
  }
});
app.post('/admin/groups/:group_id/forms', auth, adminOnly, async (req, res) => {
  const { group_id } = req.params;
  const { title, short_desc, full_desc, goal, reward, order } = req.body;

  try {
    const { data, error } = await supabase
      .from('forms')
      .insert([{
        group_id,
        title,
        short_desc,
        full_desc,
        goal,
        reward,
        order: order ?? 0
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ form: data });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания анкеты' });
  }
});
app.get('/forms', auth, async (req, res) => {
  const { group_id } = req.query;

  try {
    let query = supabase
      .from('forms')
      .select('id, title, short_desc, full_desc, goal, reward, group_id, "order"')
      .order('order', { ascending: true });

    if (group_id) {
      query = query.eq('group_id', group_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ forms: data });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения анкет' });
  }
});
app.post('/progress/:form_id', auth, async (req, res) => {
  const { form_id } = req.params;
  const { last_question_index, completed = false } = req.body;
  const user_id = req.user.id;

  try {
    const { error } = await supabase
      .from('form_progress')
      .upsert([{ user_id, form_id, last_question_index, completed }], {
        onConflict: ['user_id', 'form_id']
      });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления прогресса' });
  }
});
app.get('/progress/:form_id', auth, async (req, res) => {
  const { form_id } = req.params;
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('form_progress')
      .select('last_question_index, completed')
      .eq('user_id', user_id)
      .eq('form_id', form_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { last_question_index: 0, completed: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения прогресса' });
  }
});
app.get('/progress/group/:group_id', auth, async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user.id;

  try {
    // Получаем все анкеты в группе
    const { data: forms, error: formsErr } = await supabase
      .from('forms')
      .select('id')
      .eq('group_id', group_id);

    if (formsErr) throw formsErr;
    const formIds = forms.map(f => f.id);

    if (formIds.length === 0) {
      return res.json({ total: 0, completed: 0, in_progress: [] });
    }

    // Получаем прогресс пользователя по этим анкетам
    const { data: progress, error: progErr } = await supabase
      .from('form_progress')
      .select('form_id, last_question_index, completed')
      .eq('user_id', user_id)
      .in('form_id', formIds);

    if (progErr) throw progErr;

    const completedCount = progress.filter(p => p.completed).length;

    res.json({
      total: formIds.length,
      completed: completedCount,
      in_progress: progress
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения прогресса по группе' });
  }
});
app.put('/admin/groups/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const { error } = await supabase
      .from('form_groups')
      .update({ title, description })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления группы' });
  }
});
app.put('/admin/forms/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { title, short_desc, full_desc, goal, reward } = req.body;

  try {
    const { error } = await supabase
      .from('forms')
      .update({
        title,
        short_desc,
        full_desc,
        goal,
        reward
      })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления анкеты' });
  }
});
app.delete('/admin/groups/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('form_groups')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: 'Ошибка при удалении группы' });
  res.json({ success: true });
});
app.delete('/admin/forms/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: 'Ошибка при удалении анкеты' });
  res.json({ success: true });
});
app.delete('/admin/questions/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: 'Ошибка при удалении вопроса' });
  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
