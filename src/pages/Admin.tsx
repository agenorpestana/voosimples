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
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingEbook, setEditingEbook] = useState<any>(null);

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
      setSettings(data);
      if (data.SITE_CONTENT) {
        try {
          setSiteData(JSON.parse(data.SITE_CONTENT));
        } catch(e) {
          setSiteData(defaultSiteContent);
        }
      } else {
        setSiteData(defaultSiteContent);
      }
    }
  };

  const saveSettings = async () => {
    try {
      const currentSettings = { ...settings };
      if (siteData) {
        currentSettings.SITE_CONTENT = JSON.stringify(siteData);
      }
      const res = await fetch('/api/admin/settings', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: currentSettings })
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
                  {siteData?.plans?.map((p: any) => p.status !== 'inactive' ? <option key={p.id} value={p.id}>{p.name}</option> : null)}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button onClick={updateUser} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-bold">Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar/Adicionar Plano */}
        {editingPlan && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">{siteData.plans?.find((p: any) => p.id === editingPlan.id) ? 'Editar Plano' : 'Novo Plano'}</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Plano (Nome curto sem espaços - ex: premium)</label>
                  <input type="text" value={editingPlan.id} onChange={e => setEditingPlan({...editingPlan, id: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                  <p className="text-xs text-gray-500 mt-1">Apenas crie um novo ID se for um plano novo. Não altere o ID se já existirem usuários vinculados a ele.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição (ex: VIP Completo)</label>
                  <input type="text" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo de Cobrança</label>
                  <select value={editingPlan.cycle || 'mensal'} onChange={e => setEditingPlan({...editingPlan, cycle: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600">
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="vitalicio">Vitalício</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (ex: 49,90 - use "0" se for grátis)</label>
                  <input type="text" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vantagens (digite cada vantagem em uma nova linha)</label>
                  <textarea value={editingPlan.features} onChange={e => setEditingPlan({...editingPlan, features: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" rows={4} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editingPlan.isPopular} onChange={e => setEditingPlan({...editingPlan, isPopular: e.target.checked})} id="isPopularPlan" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="isPopularPlan" className="text-sm font-medium text-gray-700">Destacar como card "Mais Popular"</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Cancelar</button>
                <button onClick={() => {
                  if (!editingPlan.id || !editingPlan.name) return alert("ID e Nome são obrigatórios.");
                  const isNew = !siteData.plans.find((p: any) => p.id === editingPlan.id);
                  if (isNew) {
                    setSiteData({...siteData, plans: [...(siteData.plans || []), editingPlan]});
                  } else {
                    setSiteData({...siteData, plans: siteData.plans.map((p: any) => p.id === editingPlan.id ? editingPlan : p)});
                  }
                  setEditingPlan(null);
                }} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar Plano</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar/Adicionar eBook */}
        {editingEbook && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-xl font-bold mb-4">{siteData.ebooks?.find((e: any) => e.id === editingEbook.id) ? 'Editar eBook' : 'Novo eBook'}</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título do Livro</label>
                  <input type="text" value={editingEbook.title} onChange={e => setEditingEbook({...editingEbook, title: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
                  <textarea value={editingEbook.description} onChange={e => setEditingEbook({...editingEbook, description: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag/Selo (Opcional - ex: Novo, Mais Vendido)</label>
                  <input type="text" value={editingEbook.tag} onChange={e => setEditingEbook({...editingEbook, tag: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem da Capa (Opcional)</label>
                  <input type="text" value={editingEbook.coverUrl || ''} onChange={e => setEditingEbook({...editingEbook, coverUrl: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" placeholder="https://exemplo.com/imagem.png" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingEbook(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Cancelar</button>
                <button onClick={() => {
                  if (!editingEbook.title) return alert("Título é obrigatório.");
                  const isNew = !siteData.ebooks.find((e: any) => e.id === editingEbook.id);
                  if (isNew) {
                    setSiteData({...siteData, ebooks: [...(siteData.ebooks || []), editingEbook]});
                  } else {
                    setSiteData({...siteData, ebooks: siteData.ebooks.map((e: any) => e.id === editingEbook.id ? editingEbook : e)});
                  }
                  setEditingEbook(null);
                }} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar eBook</button>
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

        {activeTab === 'site' && siteData && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Configurações do Site</h2>
            {saveMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{saveMessage}</div>}
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-xl font-bold mb-4">Banner Principal (Hero)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título do Banner</label>
                  <input type="text" value={siteData.heroTitle || ''} onChange={e => setSiteData({...siteData, heroTitle: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto Secundário do Banner (Subtítulo)</label>
                  <textarea value={siteData.heroSubtitle || ''} onChange={e => setSiteData({...siteData, heroSubtitle: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-600" rows={3} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Planos</h3>
                <button onClick={() => setEditingPlan({ id: Date.now().toString(), name: '', price: '0', cycle: 'mensal', features: '', isPopular: false, status: 'active' })} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700">Adicionar Plano</button>
              </div>
              <div className="space-y-2">
                {siteData.plans?.map((plan: any) => {
                   const usersWithPlan = usersList.filter(u => u.plan === plan.id).length;
                   return (
                    <div key={plan.id} className={`p-4 border rounded flex flex-col md:flex-row justify-between items-center gap-4 ${plan.status === 'inactive' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                      <div>
                        <div className="font-bold">{plan.name} (R$ {plan.price}{plan.cycle ? ` - ${plan.cycle}` : ''}) {plan.status === 'inactive' && <span className="text-red-500 text-xs ml-2">INATIVO</span>}</div>
                        <div className="text-sm text-gray-500">ID: {plan.id} | Vinculado a {usersWithPlan} usuário(s)</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSiteData({...siteData, plans: siteData.plans.map((p: any) => p.id === plan.id ? {...p, status: p.status === 'inactive' ? 'active' : 'inactive'} : p)})} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium whitespace-nowrap">
                          {plan.status === 'inactive' ? 'Ativar' : 'Inativar'}
                        </button>
                        <button onClick={() => setEditingPlan(plan)} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium whitespace-nowrap">Editar</button>
                        {usersWithPlan === 0 && (
                          <button onClick={() => { if(confirm('Excluir plano?')) setSiteData({...siteData, plans: siteData.plans.filter((p: any) => p.id !== plan.id)}) }} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium whitespace-nowrap">Excluir</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">eBooks (Cards)</h3>
                <button onClick={() => setEditingEbook({ id: Date.now().toString(), title: '', description: '', tag: '', coverUrl: '', status: 'active' })} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700">Adicionar eBook</button>
              </div>
              <div className="space-y-2">
                {siteData.ebooks?.map((ebook: any) => (
                  <div key={ebook.id} className={`p-4 border rounded flex flex-col md:flex-row justify-between items-center gap-4 ${ebook.status === 'inactive' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                    <div>
                      <div className="font-bold">{ebook.title} {ebook.status === 'inactive' && <span className="text-red-500 text-xs ml-2">INATIVO</span>}</div>
                      <div className="text-sm text-gray-500">{ebook.tag || 'Sem tag'}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSiteData({...siteData, ebooks: siteData.ebooks.map((e: any) => e.id === ebook.id ? {...e, status: e.status === 'inactive' ? 'active' : 'inactive'} : e)})} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium whitespace-nowrap">
                        {ebook.status === 'inactive' ? 'Ativar' : 'Inativar'}
                      </button>
                      <button onClick={() => setEditingEbook(ebook)} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium whitespace-nowrap">Editar</button>
                      <button onClick={() => { if(confirm('Excluir eBook?')) setSiteData({...siteData, ebooks: siteData.ebooks.filter((e: any) => e.id !== ebook.id)}) }} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium whitespace-nowrap">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveSettings} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
              Salvar Configurações do Site
            </button>
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
