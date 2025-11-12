import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Account } from '../types/account';
import { DashboardStats } from '../types/dashboardStats';

interface DashboardProps {
  accounts: Account[];
}

export const Dashboard: React.FC<DashboardProps> = ({ accounts }) => {
  const calculateStats = (): DashboardStats => {
    const totalIncome = accounts
      .filter(acc => acc.type === 'income')
      .reduce((sum, acc) => sum + acc.value, 0);
    
    const totalExpenses = accounts
      .filter(acc => acc.type === 'expense')
      .reduce((sum, acc) => sum + acc.value, 0);
    
    const balance = totalIncome - totalExpenses;
    const pendingAccounts = accounts.filter(acc => acc.status === 'pending').length;
    const overdueAccounts = accounts.filter(acc => acc.status === 'overdue').length;
    const paidAccounts = accounts.filter(acc => acc.status === 'paid').length;

    return {
      totalIncome,
      totalExpenses,
      balance,
      pendingAccounts,
      overdueAccounts,
      paidAccounts,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
  }> = ({ title, value, icon, trend = 'neutral', className = '' }) => (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 will-change-transform ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-green-100 text-green-600' :
          trend === 'down' ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Receitas"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="w-6 h-6" />}
          trend="down"
          className="border-l-4 border-l-red-500"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(stats.balance)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={stats.balance >= 0 ? 'up' : 'down'}
          className={`border-l-4 ${stats.balance >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Contas Pendentes"
          value={stats.pendingAccounts.toString()}
          icon={<Clock className="w-6 h-6" />}
          className="border-l-4 border-l-yellow-500"
        />
        <StatCard
          title="Contas Vencidas"
          value={stats.overdueAccounts.toString()}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend="down"
          className="border-l-4 border-l-red-500"
        />
        <StatCard
          title="Contas Pagas"
          value={stats.paidAccounts.toString()}
          icon={<CheckCircle className="w-6 h-6" />}
          trend="up"
          className="border-l-4 border-l-green-500"
        />
      </div>
    </div>
  );
};