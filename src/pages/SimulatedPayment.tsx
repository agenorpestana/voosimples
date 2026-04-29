import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function SimulatedPayment() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const completePayment = async () => {
      try {
        const res = await fetch('/api/simulate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          // Forçar a reobtenção do status do usuário, então recarrega
          setTimeout(() => {
            window.location.href = '/dashboard?payment=success';
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch(err) {
        setStatus('error');
      }
    };
    
    // Simulate delay
    setTimeout(completePayment, 2000);
  }, [orderId, navigate]);

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow border border-gray-100 text-center max-w-sm w-full">
        {status === 'processing' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Processando Pagamento...</h2>
            <p className="text-gray-500 mt-2 text-sm">Aguarde enquanto simulamos a aprovação do Mercado Pago.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
            <h2 className="text-xl font-bold">Pagamento Aprovado!</h2>
            <p className="text-gray-500 mt-2 text-sm">Seu plano premium foi liberado. Redirecionando...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✕</div>
            <h2 className="text-xl font-bold">Erro no Pagamento</h2>
            <p className="text-gray-500 mt-2 text-sm">Não foi possível aprovar seu pagamento simulado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
