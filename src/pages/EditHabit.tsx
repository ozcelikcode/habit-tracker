import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHabit } from '../api';
import HabitForm from '../components/HabitForm';

export default function EditHabit() {
  const { id } = useParams<{ id: string }>();
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadHabit(parseInt(id));
    }
  }, [id]);

  async function loadHabit(habitId: number) {
    try {
      const data = await getHabit(habitId);
      setHabit(data);
    } catch (err) {
      setError('Alışkanlık bulunamadı');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Alışkanlığı Düzenle</h1>
        <p className="text-gray-600 dark:text-white/60 mt-2">Alışkanlık bilgilerini güncelleyin.</p>
      </div>

      {habit && <HabitForm initialData={habit} />}
    </div>
  );
}
