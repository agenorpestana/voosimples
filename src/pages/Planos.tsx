import { Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export default function Planos() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!user) {
      navigate('/cadastro?plan=' + plan);
      return;
    }
    if (plan === 'free') {
      alert('Plano grátis ativado.');
      return;
    }
    
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Escolha o plano ideal para sua aprovação</h2>
          <p className="text-xl text-gray-600">Planos flexíveis para Piloto Privado e Piloto Comercial.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Grátis */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Grátis</h3>
            <div className="text-4xl font-black mb-6">R$ 0<span className="text-lg text-gray-500 font-normal">/mês</span></div>
            <ul className="mb-8 space-y-4 flex-1">
              <li className="flex gap-2"><Check className="text-green-500" /> 5 simulados por mês</li>
              <li className="flex gap-2"><Check className="text-green-500" /> Estatísticas básicas</li>
            </ul>
            <button onClick={() => handleCheckout('free')} className="w-full py-3 rounded-lg font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
              {loading === 'free' ? 'Aguarde...' : 'Cadastrar Grátis'}
            </button>
          </div>

          {/* Premium */}
          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl flex flex-col relative transform -translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">Mais Popular</div>
            <h3 className="text-2xl font-bold mb-2">Premium PP/PC</h3>
            <div className="text-4xl font-black mb-6">R$ 49,90<span className="text-lg text-blue-200 font-normal">/mês</span></div>
            <ul className="mb-8 space-y-4 flex-1">
              <li className="flex gap-2"><Check className="text-yellow-400" /> Simulados ILIMITADOS</li>
              <li className="flex gap-2"><Check className="text-yellow-400" /> Aprendizado Adaptativo</li>
              <li className="flex gap-2"><Check className="text-yellow-400" /> Explicações detalhadas</li>
              <li className="flex gap-2"><Check className="text-yellow-400" /> Acesso aos eBooks base</li>
            </ul>
            <button onClick={() => handleCheckout('premium')} className="w-full py-3 rounded-lg font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors">
              {loading === 'premium' ? 'Redirecionando...' : 'Assinar Premium'}
            </button>
          </div>

          {/* VIP */}
           <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold mb-2">VIP Completo</h3>
            <div className="text-4xl font-black mb-6">R$ 89,90<span className="text-lg text-gray-400 font-normal">/mês</span></div>
            <ul className="mb-8 space-y-4 flex-1">
              <li className="flex gap-2"><Check className="text-green-400" /> Tudo do Premium</li>
              <li className="flex gap-2"><Check className="text-green-400" /> Dúvidas com Tutores</li>
              <li className="flex gap-2"><Check className="text-green-400" /> Garantia de Aprovação</li>
              <li className="flex gap-2"><Check className="text-green-400" /> Simulador Específico (IFR)</li>
            </ul>
            <button onClick={() => handleCheckout('vip')} className="w-full py-3 rounded-lg font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors">
              {loading === 'vip' ? 'Redirecionando...' : 'Assinar VIP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
