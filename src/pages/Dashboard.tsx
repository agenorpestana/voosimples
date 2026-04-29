import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de estudos.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
          Plano Ativo: {user.plan ? user.plan.toUpperCase() : 'FREE'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Simulados Feitos</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Média Geral</p>
            <p className="text-2xl font-bold text-gray-900">0%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Questões Certas</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tempo de Estudo</p>
            <p className="text-2xl font-bold text-gray-900">0h</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Simulados Disponíveis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg mb-2">Simulado {i} da ANAC</h3>
              <p className="text-sm text-gray-600 mb-4">20 questões • 30 minutos</p>
              <button className="w-full bg-blue-600 text-white font-medium py-2 rounded border border-transparent hover:bg-blue-700 transition">
                Iniciar Simulado
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
