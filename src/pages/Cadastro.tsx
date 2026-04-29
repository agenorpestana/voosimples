import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams, useNavigate, Link } from 'react-router';

export default function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Se veio pela página de planos, já seleciona o plano correspondente
  useState(() => {
    const intendedPlan = searchParams.get('plan');
    if (intendedPlan && ['free', 'premium', 'vip'].includes(intendedPlan)) {
      setPlan(intendedPlan);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar cadastro');
      
      login(data.user, data.token);
      
      // Se escolheu um plano pago, redireciona para o checkout ou página de planos
      if (data.intendedPlan && data.intendedPlan !== 'free') {
        // Redireciona para Planos para que o clique inicie o checkout automaticamente? 
        // Ou melhor, podemos chamar a API de checkout aqui mesmo
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`
          },
          body: JSON.stringify({ plan: data.intendedPlan })
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.init_point) {
          window.location.href = checkoutData.init_point;
          return;
        }
      }
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center">Criar conta</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600" placeholder="Joao Silva" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600" placeholder="joao@exemplo.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600" placeholder="Sua senha" minLength={6} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escolha seu plano</label>
            <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600" required>
              <option value="free">Plano Grátis - 5 simulados/mês</option>
              <option value="premium">Plano Premium - R$ 49,90</option>
              <option value="vip">Plano VIP - R$ 89,90</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Processando...' : 'Cadastrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta? <Link to="/login" className="text-blue-600 hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
