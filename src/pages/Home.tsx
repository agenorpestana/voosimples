import { CheckCircle, BookOpen, BarChart } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Planos from './Planos';
import Ebooks from './Ebooks';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Prepare-se para a ANAC com o VooSimples</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Simulados atualizados, aprendizado adaptativo e acompanhamento de progresso completo para garantir sua aprovação.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#planos" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg">
              Começar Grátis
            </a>
            <a href="#planos" className="bg-transparent border border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              Ver Planos Premium
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Questões Atualizadas</h3>
              <p className="text-gray-600">Banco de dados com milhares de questões baseadas nas provas mais recentes da ANAC.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full text-green-600 mb-6">
                <BarChart className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Progresso Inteligente</h3>
              <p className="text-gray-600">Acompanhe seu desempenho por matéria com nosso algoritmo de aprendizado adaptativo.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full text-purple-600 mb-6">
                <BookOpen className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Material de Apoio</h3>
              <p className="text-gray-600">Acesso a eBooks e resumos de conteúdo desenvolvidos por especialistas da aviação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos">
        <Planos />
      </section>

      {/* Ebooks Section */}
      <section id="ebooks" className="bg-white">
        <Ebooks />
      </section>
    </div>
  );
}
