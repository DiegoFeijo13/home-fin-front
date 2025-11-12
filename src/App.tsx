import React, { useState, useMemo } from 'react';
import { BarChart3, Home, FileText, Calendar, Users, LogOut, User } from 'lucide-react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { AccountList } from './components/AccountList';
import { AccountForm } from './components/AccountForm';
import { FilterBar } from './components/FilterBar';
import { MonthlyReport } from './components/MonthlyReport';
import { ExpenseSharingReport } from './components/ExpenseSharingReport';
import { CSVImporter } from './components/CSVImporter';
import { useAccounts } from './hooks/useAccounts';
import { useAuth } from './hooks/useAuth';
import { Account } from './types/account';

type TabType = 'dashboard' | 'accounts' | 'reports' | 'sharing';

function App() {
  const { authState, login, register, logout } = useAuth();  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showCSVImporter, setShowCSVImporter] = useState(false);

  // Only initialize accounts hook when user is authenticated
  const accountsHookResult = useAccounts();
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = authState.isAuthenticated 
    ? accountsHookResult 
    : { accounts: [], loading: false, addAccount: async () => {}, updateAccount: async () => {}, deleteAccount: async () => {} };
    
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
        // Verificar se é conta recorrente
        const { isRecurring, recurringMonths, ...baseAccountData } = accountData as any;

        if (isRecurring && recurringMonths > 1) {
          // Criar múltiplas contas para os próximos meses
          for (let i = 0; i < recurringMonths; i++) {
            const dueDate = new Date(baseAccountData.dueDate);
            dueDate.setUTCMonth(dueDate.getUTCMonth() + i);

            const monthlyAccount = {
              ...baseAccountData,
              dueDate: dueDate.toISOString(),
            };

            await addAccount(monthlyAccount);
          }
        } else {
          await addAccount(baseAccountData);
        }
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

  const handleImportSuccess = () => {
    // Recarregar as contas após importação bem-sucedida
    // A função refreshAccounts já existe no hook useAccounts
    window.location.reload(); // Alternativa simples para recarregar tudo
  };

  // Mostrar tela de loading durante inicialização da autenticação
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulário de autenticação se não estiver logado
  if (!authState.isAuthenticated) {
    return (      
      <AuthForm
        onLogin={login}
        onRegister={register}
        isLoading={authState.isLoading}
      />      
    );
  }

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

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{authState.user?.name}</span>
                <span className="text-gray-400">({authState.user?.username})</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-1 ml-auto mr-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'accounts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FileText className="w-4 h-4" />
                Contas
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'reports'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                Relatórios
              </button>
              <button
                onClick={() => setActiveTab('sharing')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'sharing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Users className="w-4 h-4" />
                Divisão
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
                onImportClick={() => setShowCSVImporter(true)}
              />

              <AccountList
                accounts={filteredAccounts}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
              />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatório Mensal</h2>
              <p className="text-gray-600">Visualização das contas dos últimos três meses</p>
            </div>
            <MonthlyReport accounts={accounts} />
          </div>
        )}

        {activeTab === 'sharing' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Divisão de Contas</h2>
              <p className="text-gray-600">Divida despesas entre pessoas e calcule sua parte</p>
            </div>
            <ExpenseSharingReport accounts={accounts} />
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

      {/* CSV Importer Modal */}
      {showCSVImporter && (
        <CSVImporter
          onClose={() => setShowCSVImporter(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>    
  );
}

export default App;