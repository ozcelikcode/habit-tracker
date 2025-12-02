import HabitForm from '../components/HabitForm';

export default function NewHabit() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Yeni Alışkanlık Ekle</h1>
        <p className="text-gray-600 dark:text-white/60 mt-2">Takip etmek istediğiniz yeni bir alışkanlık oluşturun.</p>
      </div>

      <HabitForm />
    </div>
  );
}
