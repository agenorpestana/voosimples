import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import Contatos from './pages/Contatos';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import SimulatedPayment from './pages/SimulatedPayment';
import { useAuth } from './hooks/useAuth';
import { Plane, LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                <Plane className="w-6 h-6" />
                VooSimples
              </Link>
              <div className="flex items-center gap-6">
                <Link to="/" className="hover:text-blue-200 transition-colors">Início</Link>
                <a href="/#planos" className="hover:text-blue-200 transition-colors">Planos</a>
                <a href="/#ebooks" className="hover:text-blue-200 transition-colors">eBooks</a>
                <Link to="/contatos" className="hover:text-blue-200 transition-colors">Contatos</Link>
                
                {user ? (
                  <div className="flex items-center gap-4 ml-4">
                    {user.role === 'admin' ? (
                      <Link to="/admin" className="hover:text-blue-200 transition-colors">Painel Admin</Link>
                    ) : (
                      <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Meu Painel</Link>
                    )}
                    <span className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> {user.name}</span>
                    <button onClick={() => { logout(); window.location.href = '/login'; }} className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 ml-4">
                    <Link to="/login" className="hover:text-blue-200 transition-colors font-medium">Entrar</Link>
                    <a href="/#planos" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                      Começar Grátis
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contatos" element={<Contatos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/simulated-payment" element={<SimulatedPayment />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} VooSimples. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
