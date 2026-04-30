import { Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Planos() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const content = useSiteContent();

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
          {content.plans.filter((p: any) => p.active !== false).map((plan: any) => (
            <div key={plan.id} className={`${plan.isPopular ? 'bg-blue-600 text-white shadow-xl transform -translate-y-4' : plan.id === 'vip' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white p-8 rounded-2xl shadow-sm border border-gray-100'} p-8 rounded-2xl flex flex-col relative`}>
              {plan.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">Mais Popular</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-black mb-6">
                R$ {plan.price}
                <span className={`text-lg font-normal ${plan.isPopular ? 'text-blue-200' : plan.id === 'vip' ? 'text-gray-400' : 'text-gray-500'}`}>/mês</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                {plan.features.split('\n').map((feature: string, i: number) => (
                  <li key={i} className="flex gap-2 text-left">
                    <Check className={plan.isPopular ? 'text-yellow-400 flex-shrink-0' : plan.id === 'vip' ? 'text-green-400 flex-shrink-0' : 'text-green-500 flex-shrink-0'} /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCheckout(plan.id)} className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.isPopular ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : plan.id === 'vip' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}>
                {loading === plan.id ? 'Aguarde...' : (plan.price === '0' ? 'Cadastrar Grátis' : 'Assinar ' + plan.name)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
