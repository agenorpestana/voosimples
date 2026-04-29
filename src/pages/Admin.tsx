import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { Users, Activity, ShieldAlert, FileText, Settings } from 'lucide-react';

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'logs') fetchLogs();
    else if (activeTab === 'settings') fetchSettings();
  }, [user, activeTab, navigate]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsersList(await res.json());
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setLogsList(await res.json());
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSettings(await res.json());
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        setSaveMessage('Configurações salvas com sucesso!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col p-4 space-y-2">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Users className="w-5 h-5" />
          Usuários
        </button>
        <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Activity className="w-5 h-5" />
          Auditoria & Logs
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <FileText className="w-5 h-5" />
          Relatórios
        </button>
        <button onClick={() => setActiveTab('alerts')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'alerts' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ShieldAlert className="w-5 h-5" />
          Alertas de Segurança
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Settings className="w-5 h-5" />
          Configurações
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Novo Usuário</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">Nome</th>
                    <th className="p-4 font-medium text-gray-500">E-mail</th>
                    <th className="p-4 font-medium text-gray-500">Permissão</th>
                    <th className="p-4 font-medium text-gray-500">Plano</th>
                    <th className="p-4 font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4 text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-blue-600">{u.plan ? u.plan.toUpperCase() : 'FREE'}</td>
                      <td className="p-4 text-blue-600 hover:underline cursor-pointer">Editar</td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Auditoria e Logs de Atividades</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">Data/Hora</th>
                    <th className="p-4 font-medium text-gray-500">Usuário</th>
                    <th className="p-4 font-medium text-gray-500">Ação</th>
                    <th className="p-4 font-medium text-gray-500">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logsList.map((log: any) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-medium">{log.userEmail || 'Desconhecido'}</td>
                      <td className="p-4 font-medium text-blue-600">{log.action}</td>
                      <td className="p-4 text-gray-600">{log.details}</td>
                    </tr>
                  ))}
                  {logsList.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum log encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Configurações do Sistema</h2>
            {saveMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{saveMessage}</div>}
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Integração Mercado Pago</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Key de Produção</label>
                  <input 
                    type="text" 
                    value={settings.MERCADO_PAGO_PUBLIC_KEY || ''} 
                    onChange={e => setSettings({...settings, MERCADO_PAGO_PUBLIC_KEY: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                    placeholder="APP_USR-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Insira a Public Key do Mercado Pago (opcional para algumas integrações Webhooks).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Token de Produção</label>
                  <input 
                    type="text" 
                    value={settings.MERCADO_PAGO_ACCESS_TOKEN || ''} 
                    onChange={e => setSettings({...settings, MERCADO_PAGO_ACCESS_TOKEN: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                    placeholder="APP_USR-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Insira o token para gerar links de checkout dinâmicos. Caso fique em branco, o sistema entrará em modo de simulação de pagamentos para testes.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={saveSettings} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
              Salvar Configurações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
