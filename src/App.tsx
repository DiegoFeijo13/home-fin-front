import React, { useState, useMemo } from 'react';
import { BarChart3, Home, FileText } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AccountList } from './components/AccountList';
import { AccountForm } from './components/AccountForm';
import { FilterBar } from './components/FilterBar';
import { useAccounts } from './hooks/useAccounts';
import { Account } from './types';

type TabType = 'dashboard' | 'accounts';

function App() {
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Filtrar contas baseado nos filtros aplicados
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || account.status === statusFilter;
      const matchesType = !typeFilter || account.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [accounts, searchTerm, statusFilter, typeFilter]);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleSaveAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, accountData);
      } else {
        await addAccount(accountData);
      }
      setShowAccountForm(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta. Tente novamente.');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta. Tente novamente.');
      }
    }
  };

  const handleCancelForm = () => {
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Controle Financeiro</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'accounts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Contas
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h2>
              <p className="text-gray-600">Visão geral das suas finanças</p>
            </div>
            <Dashboard accounts={accounts} />
          </div>
        )}

        {activeTab === 'accounts' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Contas</h2>
              <p className="text-gray-600">Gerencie suas receitas e despesas</p>
            </div>
            
            <div className="space-y-6">
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                onAddClick={handleAddAccount}
              />

              <AccountList
                accounts={filteredAccounts}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
              />
            </div>
          </div>
        )}
      </main>

      {/* Account Form Modal */}
      {showAccountForm && (
        <AccountForm
          account={editingAccount || undefined}
          onSave={handleSaveAccount}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}

export default App;