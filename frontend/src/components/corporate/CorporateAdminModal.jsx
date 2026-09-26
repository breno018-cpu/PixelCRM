import React, { useState, useEffect } from 'react';
import { 
  Building2, Store, Users, Shield, UserCheck, Activity, X, Plus, 
  Copy, Edit2, Trash2, Check, AlertCircle, Loader2, Save, ArrowRight,
  ShieldAlert, RefreshCw, Search, ChevronRight, Lock, Eye, CheckCircle2
} from 'lucide-react';
import { authFetch } from '../../context/CRMContext';

export default function CorporateAdminModal({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('company'); // company, stores, teams, roles, users, audit
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Dados da Empresa
  const [company, setCompany] = useState({
    name: '',
    tradeName: '',
    legalName: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL'
  });

  // 2. Lojas
  const [stores, setStores] = useState([]);
  const [storeForm, setStoreForm] = useState(null); // { id, name, code, address, phone, businessHours, status }

  // 3. Equipes
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState(null); // { id, name, description, storeId, leaderId }

  // 4. Cargos e Permissões
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleForm, setRoleForm] = useState(null); // { id, name, description, scope, teamId, permissions: [] }
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicatingRoleId, setDuplicatingRoleId] = useState(null);

  // 5. Usuários
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(null); // { id, name, email, password, phone, roleId, storeId, teamId, isActive }

  // 6. Auditoria
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [compRes, storesRes, teamsRes, rolesRes, permsRes, usersRes] = await Promise.all([
        authFetch('http://localhost:5000/api/companies/current'),
        authFetch('http://localhost:5000/api/stores'),
        authFetch('http://localhost:5000/api/teams'),
        authFetch('http://localhost:5000/api/roles'),
        authFetch('http://localhost:5000/api/permissions'),
        authFetch('http://localhost:5000/api/users')
      ]);

      if (compRes.ok) setCompany(await compRes.json());
      if (storesRes.ok) setStores(await storesRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (permsRes.ok) setPermissions(await permsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados corporativos:', err);
      setErrorMsg('Falha ao conectar aos serviços corporativos da API.');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/audit-logs');
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  // Mensagem temporária
  const showFeedback = (success, error = '') => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // Salvar Empresa
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg('');
    try {
      const res = await authFetch('http://localhost:5000/api/companies/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      if (res.ok) {
        showFeedback('Dados corporativos da empresa atualizados com sucesso!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao atualizar dados da empresa.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão com o servidor.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Salvar Loja
  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const method = storeForm.id ? 'PUT' : 'POST';
      const url = storeForm.id ? `http://localhost:5000/api/stores/${storeForm.id}` : 'http://localhost:5000/api/stores';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm)
      });
      if (res.ok) {
        const updatedStores = await (await authFetch('http://localhost:5000/api/stores')).json();
        setStores(updatedStores);
        setStoreForm(null);
        showFeedback('Filial salva com sucesso!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao salvar filial.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Salvar Equipe
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const method = teamForm.id ? 'PUT' : 'POST';
      const url = teamForm.id ? `http://localhost:5000/api/teams/${teamForm.id}` : 'http://localhost:5000/api/teams';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      if (res.ok) {
        const updatedTeams = await (await authFetch('http://localhost:5000/api/teams')).json();
        setTeams(updatedTeams);
        setTeamForm(null);
        showFeedback('Equipe salva com sucesso!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao salvar equipe.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Duplicar Cargo
  const handleDuplicateRole = async (roleId) => {
    setSaveLoading(true);
    try {
      const res = await authFetch(`http://localhost:5000/api/roles/${roleId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: duplicateName.trim() || undefined })
      });
      if (res.ok) {
        const updatedRoles = await (await authFetch('http://localhost:5000/api/roles')).json();
        setRoles(updatedRoles);
        setDuplicatingRoleId(null);
        setDuplicateName('');
        showFeedback('Cargo duplicado com sucesso com todas as permissões clonadas!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao duplicar cargo.');
      }
    } catch (err) {
      showFeedback('', 'Erro ao duplicar cargo.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Salvar Cargo com Permissões
  const handleSaveRole = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const method = roleForm.id ? 'PUT' : 'POST';
      const url = roleForm.id ? `http://localhost:5000/api/roles/${roleForm.id}` : 'http://localhost:5000/api/roles';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      if (res.ok) {
        const updatedRoles = await (await authFetch('http://localhost:5000/api/roles')).json();
        setRoles(updatedRoles);
        setRoleForm(null);
        showFeedback('Cargo e matriz de permissões salvos com sucesso!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao salvar cargo.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão ao salvar cargo.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Salvar Usuário
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const method = userForm.id ? 'PUT' : 'POST';
      const url = userForm.id ? `http://localhost:5000/api/users/${userForm.id}` : 'http://localhost:5000/api/users';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        const updatedUsers = await (await authFetch('http://localhost:5000/api/users')).json();
        setUsers(updatedUsers);
        setUserForm(null);
        showFeedback('Usuário corporativo salvo com sucesso!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao salvar usuário.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl border border-[var(--border-light)] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--header-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E30613] to-[#B0040E] text-white flex items-center justify-center shadow-md">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Governança & Gestão Corporativa
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Prompt 05
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Estrutura Empresarial, Cargos, Matriz de Permissões, Equipes e Auditoria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Body com Sidebar de Abas */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navegação de Abas */}
          <div className="w-56 border-r border-[var(--border-light)] p-3 space-y-1 bg-[var(--bg-secondary)] flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('company'); setStoreForm(null); setTeamForm(null); setRoleForm(null); setUserForm(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'company'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Building2 size={16} /> Empresa Matriz
              </button>

              <button
                onClick={() => { setActiveTab('stores'); setStoreForm(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'stores'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Store size={16} /> Lojas / Filiais ({stores.length})
              </button>

              <button
                onClick={() => { setActiveTab('teams'); setTeamForm(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'teams'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Users size={16} /> Equipes ({teams.length})
              </button>

              <button
                onClick={() => { setActiveTab('roles'); setRoleForm(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'roles'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Shield size={16} /> Cargos & Permissões ({roles.length})
              </button>

              <button
                onClick={() => { setActiveTab('users'); setUserForm(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'users'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UserCheck size={16} /> Usuários ({users.length})
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'audit'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--active-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Activity size={16} /> Trilha de Auditoria
              </button>
            </div>

            <div className="p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-light)] text-[10px] space-y-1 text-[var(--text-secondary)]">
              <span className="font-bold flex items-center gap-1 text-[var(--text-primary)]">
                <Lock size={12} className="text-emerald-500" /> Governança RBAC
              </span>
              <p>Precedência rigorosa de permissões validada no backend.</p>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 p-6 overflow-y-auto bg-[var(--card-bg)]">
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
                <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                <p className="text-xs font-medium">Carregando governança corporativa...</p>
              </div>
            ) : (
              <>
                {/* 1. ABA EMPRESA */}
                {activeTab === 'company' && (
                  <form onSubmit={handleSaveCompany} className="space-y-5 max-w-3xl">
                    <div>
                      <h3 className="text-sm font-bold">Identificação da Empresa Matriz</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Dados cadastrais e jurídicos oficiais da montadora.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Razão Social</label>
                        <input
                          type="text"
                          value={company.legalName || ''}
                          onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Ex: Shineray do Brasil Montadora de Motocicletas Ltda."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Nome Fantasia</label>
                        <input
                          type="text"
                          value={company.tradeName || ''}
                          onChange={(e) => setCompany({ ...company, tradeName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Ex: Shineray Motos Brasil"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">CNPJ</label>
                        <input
                          type="text"
                          value={company.cnpj || ''}
                          onChange={(e) => setCompany({ ...company, cnpj: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Telefone Corporativo</label>
                        <input
                          type="text"
                          value={company.phone || ''}
                          onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="+55 81 3301-4000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">E-mail Corporativo</label>
                        <input
                          type="email"
                          value={company.email || ''}
                          onChange={(e) => setCompany({ ...company, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="contato@shineray.com.br"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Cidade / Estado</label>
                        <input
                          type="text"
                          value={`${company.city || ''} - ${company.state || ''}`}
                          onChange={(e) => {
                            const [city, state] = e.target.value.split('-').map(s => s.trim());
                            setCompany({ ...company, city: city || '', state: state || '' });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Cabo de Santo Agostinho - PE"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold mb-1">Endereço Completo</label>
                        <input
                          type="text"
                          value={company.address || ''}
                          onChange={(e) => setCompany({ ...company, address: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Rodovia PE-60, Complexo Industrial de Suape"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-5 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                      >
                        {saveLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Salvar Informações da Empresa
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. ABA LOJAS / FILIAIS */}
                {activeTab === 'stores' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Filiais & Concessionárias</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Gerenciamento das unidades de atendimento físico e online.</p>
                      </div>
                      {!storeForm && (
                        <button
                          onClick={() => setStoreForm({ id: null, name: '', code: '', address: '', phone: '', businessHours: 'Seg-Sex 08h-18h, Sab 08h-12h', status: 'ACTIVE' })}
                          className="px-3 py-2 bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus size={15} /> Nova Filial
                        </button>
                      )}
                    </div>

                    {storeForm ? (
                      <form onSubmit={handleSaveStore} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] space-y-3">
                        <h4 className="text-xs font-bold">{storeForm.id ? 'Editar Filial' : 'Cadastrar Nova Filial'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Nome da Loja *</label>
                            <input
                              type="text"
                              required
                              value={storeForm.name}
                              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Ex: Shineray Matriz - Recife"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Código Identificador</label>
                            <input
                              type="text"
                              value={storeForm.code || ''}
                              onChange={(e) => setStoreForm({ ...storeForm, code: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Ex: MATRIZ-01"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Telefone da Loja</label>
                            <input
                              type="text"
                              value={storeForm.phone || ''}
                              onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="(81) 3301-4000"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Horário de Funcionamento</label>
                            <input
                              type="text"
                              value={storeForm.businessHours || ''}
                              onChange={(e) => setStoreForm({ ...storeForm, businessHours: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Seg-Sex 08h às 18h"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold mb-1">Endereço Completo</label>
                            <input
                              type="text"
                              value={storeForm.address || ''}
                              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Av. Principal, 1234 - Bairro"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setStoreForm(null)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                          >
                            {saveLoading && <Loader2 size={13} className="animate-spin" />} Salvar Filial
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stores.map((s) => (
                          <div key={s.id} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] hover:shadow-sm transition-all space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                                  {s.name}
                                  {s.code && <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{s.code}</span>}
                                </h4>
                                <p className="text-[11px] text-[var(--text-secondary)]">{s.address || 'Sem endereço informado'}</p>
                              </div>
                              <button
                                onClick={() => setStoreForm(s)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--active-bg)] rounded-lg"
                                title="Editar Loja"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-light)]">
                              <span>👥 {s._count?.users || 0} operadores</span>
                              <span>💬 {s._count?.chats || 0} clientes</span>
                              <span>🏢 {s._count?.teams || 0} equipes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. ABA EQUIPES */}
                {activeTab === 'teams' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Equipes & Setores</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Divisão por setores comerciais, suporte e pós-venda.</p>
                      </div>
                      {!teamForm && (
                        <button
                          onClick={() => setTeamForm({ id: null, name: '', description: '', storeId: stores[0]?.id || '', leaderId: '' })}
                          className="px-3 py-2 bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus size={15} /> Nova Equipe
                        </button>
                      )}
                    </div>

                    {teamForm ? (
                      <form onSubmit={handleSaveTeam} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] space-y-3">
                        <h4 className="text-xs font-bold">{teamForm.id ? 'Editar Equipe' : 'Cadastrar Nova Equipe'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Nome da Equipe *</label>
                            <input
                              type="text"
                              required
                              value={teamForm.name}
                              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Ex: Comercial Shineray Motos"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Filial / Loja Vinculada</label>
                            <select
                              value={teamForm.storeId || ''}
                              onChange={(e) => setTeamForm({ ...teamForm, storeId: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                            >
                              <option value="">Todas as Filiais (Geral)</option>
                              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold mb-1">Descrição do Setor</label>
                            <input
                              type="text"
                              value={teamForm.description || ''}
                              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Atendimento focado em fechamento de propostas e consórcios"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setTeamForm(null)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                          >
                            {saveLoading && <Loader2 size={13} className="animate-spin" />} Salvar Equipe
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teams.map((t) => (
                          <div key={t.id} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">{t.name}</h4>
                                <p className="text-[11px] text-[var(--text-secondary)]">{t.description || 'Sem descrição'}</p>
                              </div>
                              <button
                                onClick={() => setTeamForm(t)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--active-bg)] rounded-lg"
                                title="Editar Equipe"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-light)]">
                              <span>🏬 {t.store?.name || 'Empresa Geral'}</span>
                              <span>👤 {t._count?.users || 0} membros</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ABA CARGOS E PERMISSÕES */}
                {activeTab === 'roles' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Cargos & Matriz de Permissões</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Criação, clonagem e ajuste fino de privilégios com escopo.</p>
                      </div>
                      {!roleForm && (
                        <button
                          onClick={() => setRoleForm({ id: null, name: '', description: '', scope: 'OWN', permissions: [] })}
                          className="px-3 py-2 bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus size={15} /> Novo Cargo
                        </button>
                      )}
                    </div>

                    {roleForm ? (
                      <form onSubmit={handleSaveRole} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold">{roleForm.id ? `Editar Cargo: ${roleForm.name}` : 'Novo Cargo Personalizado'}</h4>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                            Escopo Base: {roleForm.scope}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Nome do Cargo *</label>
                            <input
                              type="text"
                              required
                              value={roleForm.name}
                              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Ex: Vendedor Sênior"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Escopo Padrão *</label>
                            <select
                              value={roleForm.scope}
                              onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs font-bold"
                            >
                              <option value="OWN">PRÓPRIO (Apenas dados atribuídos)</option>
                              <option value="TEAM">EQUIPE (Dados de sua equipe)</option>
                              <option value="STORE">LOJA (Dados de sua filial)</option>
                              <option value="COMPANY">EMPRESA (Toda a empresa)</option>
                              <option value="ALL">GLOBAL / TOTAL (Sem restrições)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Descrição</label>
                            <input
                              type="text"
                              value={roleForm.description || ''}
                              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Ex: Atendimento avançado de frotas"
                            />
                          </div>
                        </div>

                        {/* Matriz de Permissões */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold flex items-center justify-between">
                            <span>Matriz de Ações ({permissions.length} disponíveis)</span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-normal">
                              Marque para conceder a permissão a este cargo
                            </span>
                          </h5>

                          <div className="max-h-64 overflow-y-auto border border-[var(--border-light)] rounded-xl p-2 bg-[var(--card-bg)] grid grid-cols-2 gap-2">
                            {permissions.map((p) => {
                              const isChecked = (roleForm.permissions || []).some(rp => (rp.permissionId === p.id || rp.id === p.id) && rp.granted !== false);

                              const togglePerm = () => {
                                const current = [...(roleForm.permissions || [])];
                                const idx = current.findIndex(rp => (rp.permissionId === p.id || rp.id === p.id));
                                if (idx >= 0) {
                                  current.splice(idx, 1);
                                } else {
                                  current.push({ permissionId: p.id, scope: roleForm.scope, granted: true });
                                }
                                setRoleForm({ ...roleForm, permissions: current });
                              };

                              return (
                                <label
                                  key={p.id}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                                    isChecked
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)]'
                                      : 'border-[var(--border-light)] hover:bg-[var(--active-bg)] text-[var(--text-secondary)]'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={togglePerm}
                                    className="mt-0.5 accent-[var(--primary)]"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-bold truncate flex items-center gap-1">
                                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                                        {p.action}
                                      </span>
                                      {p.resource}
                                    </div>
                                    <p className="text-[10px] line-clamp-1">{p.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setRoleForm(null)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                          >
                            {saveLoading && <Loader2 size={13} className="animate-spin" />} Salvar Cargo
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        {roles.map((r) => {
                          const isDuplicating = duplicatingRoleId === r.id;

                          return (
                            <div key={r.id} className="p-3.5 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] flex items-center justify-between gap-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{r.name}</h4>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Escopo: {r.scope}
                                  </span>
                                  {r.isSystem && (
                                    <span className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded font-semibold">
                                      Preset do Sistema
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)]">{r.description || 'Sem descrição'}</p>
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  ✓ {r.permissions?.length || 0} permissões concedidas
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isDuplicating ? (
                                  <div className="flex items-center gap-1.5 animate-fade-in">
                                    <input
                                      type="text"
                                      placeholder="Nome do novo cargo..."
                                      value={duplicateName}
                                      onChange={(e) => setDuplicateName(e.target.value)}
                                      className="px-2.5 py-1 text-xs border border-[var(--border-light)] rounded-lg bg-[var(--input-bg)] w-44"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleDuplicateRole(r.id)}
                                      disabled={saveLoading}
                                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                                    >
                                      Clonar
                                    </button>
                                    <button
                                      onClick={() => { setDuplicatingRoleId(null); setDuplicateName(''); }}
                                      className="p-1 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setDuplicatingRoleId(r.id);
                                        setDuplicateName(`${r.name} Sênior`);
                                      }}
                                      className="px-2.5 py-1 bg-[var(--bg-secondary)] hover:bg-[var(--active-bg)] text-[var(--text-primary)] rounded-lg text-xs font-semibold border border-[var(--border-light)] flex items-center gap-1 transition-all"
                                      title="Duplicar Cargo"
                                    >
                                      <Copy size={13} /> Duplicar
                                    </button>
                                    <button
                                      onClick={() => setRoleForm({ ...r, permissions: r.permissions || [] })}
                                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--active-bg)] rounded-lg transition-colors"
                                      title="Editar Permissões"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. ABA USUÁRIOS */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Colaboradores & Acessos</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Vínculo com cargos dinâmicos, filiais e equipes.</p>
                      </div>
                      {!userForm && (
                        <button
                          onClick={() => setUserForm({ id: null, name: '', email: '', password: '', phone: '', roleId: roles[0]?.id || '', storeId: stores[0]?.id || '', teamId: '', isActive: true })}
                          className="px-3 py-2 bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus size={15} /> Novo Colaborador
                        </button>
                      )}
                    </div>

                    {userForm ? (
                      <form onSubmit={handleSaveUser} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] space-y-3">
                        <h4 className="text-xs font-bold">{userForm.id ? `Editar Usuário: ${userForm.name}` : 'Cadastrar Novo Usuário'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Nome Completo *</label>
                            <input
                              type="text"
                              required
                              value={userForm.name}
                              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="Nome do operador"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">E-mail Profissional *</label>
                            <input
                              type="email"
                              required
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="nome@shineray.com.br"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">
                              {userForm.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
                            </label>
                            <input
                              type="password"
                              required={!userForm.id}
                              value={userForm.password || ''}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Telefone / WhatsApp</label>
                            <input
                              type="text"
                              value={userForm.phone || ''}
                              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                              placeholder="(81) 99999-9999"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Cargo Corporativo *</label>
                            <select
                              value={userForm.roleId || ''}
                              onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs font-semibold"
                            >
                              <option value="">Selecione um cargo...</option>
                              {roles.map(r => <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold mb-1">Filial / Concessionária</label>
                            <select
                              value={userForm.storeId || ''}
                              onChange={(e) => setUserForm({ ...userForm, storeId: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                            >
                              <option value="">Todas as Filiais</option>
                              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={userForm.isActive}
                              onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                              className="accent-[var(--primary)]"
                            />
                            Usuário Ativo (Pode autenticar e acessar o sistema)
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setUserForm(null)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                          >
                            {saveLoading && <Loader2 size={13} className="animate-spin" />} Salvar Colaborador
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {users.map((u) => (
                          <div key={u.id} className="p-3.5 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{u.name}</h4>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                    {u.roleRel?.name || u.role}
                                  </span>
                                  {!u.isActive && (
                                    <span className="text-[9px] bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded font-bold">
                                      Inativo
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)]">{u.email}</p>
                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] pt-0.5">
                                  {u.store && <span>🏬 {u.store.name}</span>}
                                  {u.team && <span>👥 {u.team.name}</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setUserForm({
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                password: '',
                                phone: u.phone || '',
                                roleId: u.roleId || '',
                                storeId: u.storeId || '',
                                teamId: u.teamId || '',
                                isActive: u.isActive !== false
                              })}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--active-bg)] rounded-lg transition-colors"
                              title="Editar Usuário"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. ABA AUDITORIA */}
                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Trilha & Logs de Auditoria</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Registro imutável de operações administrativas e de segurança.</p>
                      </div>
                      <button
                        onClick={loadAuditLogs}
                        className="px-2.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--active-bg)] rounded-lg text-xs font-semibold flex items-center gap-1 border border-[var(--border-light)]"
                      >
                        <RefreshCw size={13} /> Atualizar
                      </button>
                    </div>

                    <div className="border border-[var(--border-light)] rounded-xl overflow-hidden bg-[var(--card-bg)]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-light)] text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                          <tr>
                            <th className="p-3">Data / Hora</th>
                            <th className="p-3">Operador</th>
                            <th className="p-3">Ação</th>
                            <th className="p-3">Recurso</th>
                            <th className="p-3">IP</th>
                            <th className="p-3">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-light)] text-[11px]">
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-6 text-center text-[var(--text-secondary)]">
                                Nenhum registro de auditoria encontrado.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-[var(--active-bg)] transition-colors">
                                <td className="p-3 text-[var(--text-secondary)] whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                                </td>
                                <td className="p-3 font-semibold text-[var(--text-primary)]">
                                  {log.user?.name || 'Sistema'}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                    log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-600' :
                                    log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-600' :
                                    log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-600' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-[var(--text-secondary)]">
                                  {log.resource}
                                </td>
                                <td className="p-3 text-[var(--text-secondary)] text-[10px]">
                                  {log.ipAddress || 'Local'}
                                </td>
                                <td className="p-3 text-[var(--text-secondary)] font-mono text-[10px] max-w-xs truncate" title={log.details}>
                                  {log.details || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
