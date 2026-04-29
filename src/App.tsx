import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import Contatos from './pages/Contatos';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import SimulatedPayment from './pages/SimulatedPayment';
import { useAuth } from './hooks/useAuth';
import { Plane, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md hover:bg-blue-700 focus:outline-none transition-colors text-white"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-blue-700 pt-2 pb-4 space-y-1 px-4 border-t border-blue-500">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">Início</Link>
              <a href="/#planos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">Planos</a>
              <a href="/#ebooks" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">eBooks</a>
              <Link to="/contatos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">Contatos</Link>
              
              {user ? (
                <div className="pt-4 mt-4 border-t border-blue-500">
                  <div className="flex items-center gap-2 px-3 py-2 mb-2">
                    <UserIcon className="w-5 h-5"/> 
                    <span className="font-medium">{user.name}</span>
                  </div>
                  {user.role === 'admin' ? (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">Painel Admin</Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium">Meu Painel</Link>
                  )}
                  <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-600 font-medium mt-2">
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-blue-500 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-blue-600 font-medium text-center border border-white">Entrar</Link>
                  <a href="/#planos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md bg-white text-blue-700 font-bold hover:bg-blue-50 text-center">
                    Começar Grátis
                  </a>
                </div>
              )}
            </div>
          )}
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
