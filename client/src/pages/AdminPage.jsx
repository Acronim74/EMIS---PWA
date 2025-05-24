import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();

  const actions = [
    {
      label: '➕ Новая группа',
      description: 'Создать новую группу анкет',
      path: '/admin/groups/create'
    },
    {
      label: '➕ Новая анкета',
      description: 'Создать анкету внутри группы',
      path: '/admin/forms/create'
    },
    {
      label: '✏️ Редактировать',
      description: 'Изменить анкету или название группы',
      path: '/admin/edit'
    },
    {
      label: '🗑️ Удалить',
      description: 'Удалить группу, анкету или вопрос',
      path: '/admin/delete'
    },
    {
      label: '👁️ Просмотр',
      description: 'Посмотреть содержимое анкеты',
      path: '/admin/view'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Админ-панель</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {actions.map(action => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="p-4 rounded-xl shadow hover:shadow-md bg-white border border-gray-200 text-left text-gray-800 hover:bg-gray-50 transition"
          >
            <div className="text-lg font-semibold mb-1">{action.label}</div>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
