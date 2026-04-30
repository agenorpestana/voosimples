import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { Users, Activity, ShieldAlert, FileText, Settings } from 'lucide-react';

import { defaultSiteContent } from '../hooks/useSiteContent';

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [siteData, setSiteData] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserData, setEditUserData] = useState({ status: '', plan: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'logs') fetchLogs();
    else if (activeTab === 'settings' || activeTab === 'site') fetchSettings();
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
    if (res.ok) {
      const data = await res.json();
      let parsedSiteData = defaultSiteContent;
      if (data.SITE_CONTENT) {
        try {
          parsedSiteData = { ...defaultSiteContent, ...JSON.parse(data.SITE_CONTENT) };
        } catch(e) {}
      }
      setSiteData(parsedSiteData);
      setSettings(data);
    }
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
      } else {
        const errorText = await res.text();
        console.error('Failed to save settings:', res.status, errorText);
        let errorData = { error: errorText };
        try {
          if (errorText) errorData = JSON.parse(errorText);
        } catch(e) {}
        setSaveMessage('Erro ao salvar: ' + (errorData.error || 'Erro desconhecido.'));
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch(err) {
      console.error('Fetch error:', err);
      setSaveMessage('Erro de conexão ao salvar.');
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const updateUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editUserData)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao atualizar usuário');
      }
    } catch (err: any) {
      alert('Erro ao atualizar usuário');
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
        <button onClick={() => setActiveTab('site')} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'site' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
          <FileText className="w-5 h-5" />
          Configurações do Site
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
                    <th className="p-4 font-medium text-gray-500">Status</th>
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
                      <td className="p-4 font-medium text-gray-500 text-sm">
                        <span className={`px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status === 'active' ? 'Ativo' : u.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="p-4 text-blue-600 hover:underline cursor-pointer" onClick={() => { setEditingUser(u); setEditUserData({ status: u.status || 'active', plan: u.plan || 'free' }); }}>Editar</td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Editar Usuário */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-xl font-bold mb-4">Editar Usuário</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editUserData.status} onChange={e => setEditUserData({...editUserData, status: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-600">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                <select value={editUserData.plan} onChange={e => setEditUserData({...editUserData, plan: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-600">
                  <option value="free">Free</option>
                  <option value="premium">Premium PP/PC</option>
                  <option value="vip">VIP Completo</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button onClick={updateUser} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-bold">Salvar</button>
              </div>
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

        {activeTab === 'site' && (
          <div className="max-w-5xl pb-20">
            <h2 className="text-2xl font-bold mb-6">Configurações do Site</h2>
            {saveMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{saveMessage}</div>}
            
            {siteData && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Textos do Banner Principal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                      <input 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                        value={siteData.heroTitle || ''}
                        onChange={e => setSiteData({...siteData, heroTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo secundário</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 h-24"
                        value={siteData.heroSubtitle || ''}
                        onChange={e => setSiteData({...siteData, heroSubtitle: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Planos de Assinatura</h3>
                    <button onClick={() => {
                        const newId = 'plano-' + Date.now();
                        setSiteData({...siteData, plans: [...siteData.plans, { id: newId, name: 'Novo Plano', price: '0', features: '', active: true }]})
                      }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">
                      Adicionar Plano
                    </button>
                  </div>
                  <div className="space-y-4">
                    {siteData.plans.map((plan: any, idx: number) => {
                      const isLinked = usersList.some(u => u.plan === plan.id);
                      return (
                        <div key={idx} className={`p-5 pl-6 border-l-4 rounded-lg border border-gray-200 ${plan.active === false ? 'border-l-gray-400 bg-gray-50 opacity-70' : 'border-l-blue-600 bg-white'}`}>
                          <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Código do Plano (ID)</label>
                              <input value={plan.id} disabled className="w-full border border-gray-200 rounded p-2 bg-gray-100 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Nome do Plano</label>
                              <input value={plan.name} onChange={e => {
                                  const newPlans = [...siteData.plans];
                                  newPlans[idx].name = e.target.value;
                                  setSiteData({...siteData, plans: newPlans});
                                }} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Preço (R$)</label>
                              <input value={plan.price} onChange={e => {
                                  const newPlans = [...siteData.plans];
                                  newPlans[idx].price = e.target.value;
                                  setSiteData({...siteData, plans: newPlans});
                                }} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600" />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="flex items-center cursor-pointer mb-2">
                              <input type="checkbox" checked={plan.isPopular || false} onChange={e => {
                                const newPlans = [...siteData.plans];
                                newPlans[idx].isPopular = e.target.checked;
                                setSiteData({...siteData, plans: newPlans});
                              }} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-600 rounded" />
                              <span className="text-sm font-medium">✨ Marcar como Mais Popular (Destaque principal)</span>
                            </label>
                            
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Funcionalidades (Uma por linha)</label>
                            <textarea value={plan.features} onChange={e => {
                                const newPlans = [...siteData.plans];
                                newPlans[idx].features = e.target.value;
                                setSiteData({...siteData, plans: newPlans});
                              }} className="w-full border border-gray-300 rounded p-3 h-24 text-sm focus:ring-2 focus:ring-blue-600" />
                          </div>
                          
                          <div className="flex justify-end items-center gap-3 border-t pt-4">
                            {isLinked && <span className="text-xs text-gray-500 italic mr-auto">Vinculado a usuário(s). Exclusão desabilitada.</span>}
                            <button onClick={() => {
                                const newPlans = [...siteData.plans];
                                newPlans[idx].active = plan.active === false ? true : false;
                                setSiteData({...siteData, plans: newPlans});
                              }} className={`${plan.active === false ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-white'} px-4 py-2 rounded-lg font-medium text-sm`}>
                              {plan.active === false ? 'Reativar Plano' : 'Inativar Plano'}
                            </button>
                            {!isLinked && (
                              <button onClick={() => {
                                const newPlans = siteData.plans.filter((_: any, i: number) => i !== idx);
                                setSiteData({...siteData, plans: newPlans});
                              }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                                Excluir
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Livros Digitais (eBooks)</h3>
                    <button onClick={() => {
                        const newId = Date.now();
                        setSiteData({...siteData, ebooks: [...(siteData.ebooks||[]), { id: newId, title: 'Novo eBook', description: '', tag: '', active: true }]})
                      }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">
                      Adicionar eBook
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(siteData.ebooks || []).map((ebook: any, idx: number) => {
                      return (
                        <div key={idx} className={`p-5 border rounded-lg ${ebook.active === false ? 'opacity-70 bg-gray-50' : 'bg-white'}`}>
                           <div className="grid md:grid-cols-3 gap-4 mb-3">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Título do eBook</label>
                                <input value={ebook.title} onChange={e => {
                                    const newEbooks = [...siteData.ebooks];
                                    newEbooks[idx].title = e.target.value;
                                    setSiteData({...siteData, ebooks: newEbooks});
                                  }} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tag (Ex: "Mais Vendido", "Novo")</label>
                                <input value={ebook.tag || ''} onChange={e => {
                                    const newEbooks = [...siteData.ebooks];
                                    newEbooks[idx].tag = e.target.value;
                                    setSiteData({...siteData, ebooks: newEbooks});
                                  }} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600" />
                              </div>
                           </div>
                           <div className="mb-4">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
                              <input value={ebook.description} onChange={e => {
                                  const newEbooks = [...siteData.ebooks];
                                  newEbooks[idx].description = e.target.value;
                                  setSiteData({...siteData, ebooks: newEbooks});
                                }} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600" />
                           </div>
                           <div className="flex justify-end gap-3 border-t pt-4">
                            <button onClick={() => {
                                const newEbooks = [...siteData.ebooks];
                                newEbooks[idx].active = ebook.active === false ? true : false;
                                setSiteData({...siteData, ebooks: newEbooks});
                              }} className={`${ebook.active === false ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-white'} px-4 py-2 rounded-lg font-medium text-sm`}>
                              {ebook.active === false ? 'Reativar eBook' : 'Inativar eBook'}
                            </button>
                            <button onClick={() => {
                              const newEbooks = siteData.ebooks.filter((_: any, i: number) => i !== idx);
                              setSiteData({...siteData, ebooks: newEbooks});
                            }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                              Excluir
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="fixed bottom-0 right-0 p-6 bg-white border-t border-gray-200 w-full sm:w-[calc(100%-16rem)] flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button onClick={() => {
                      const newSettings = { ...settings, SITE_CONTENT: JSON.stringify(siteData) };
                      setSettings(newSettings);
                      fetch('/api/admin/settings', { 
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ settings: newSettings })
                        }).then(res => {
                            if (res.ok) {
                              setSaveMessage('Alterações salvas e publicadas no site!');
                              setTimeout(() => setSaveMessage(''), 4000);
                            } else {
                              setSaveMessage('Erro ao salvar as configurações.');
                            }
                        })
                  }} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg text-lg">
                    Publicar Alterações no Site
                  </button>
                </div>
              </div>
            )}
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
