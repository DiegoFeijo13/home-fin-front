import React from 'react';
import { Edit2, Trash2, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { Account } from '../types';

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onDelete }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR',{
      timeZone: 'UTC'
    });
  };

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status: Account['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
        <p className="text-gray-500">Adicione sua primeira conta para começar o controle financeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 will-change-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900 truncate">{account.description}</h3>
                {account.creditCard && (
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">{account.creditCard}</span>
                  </div>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                  {getStatusLabel(account.status)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="text-xs text-gray-600">{account.category}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(account.dueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className={`font-medium ${account.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {account.type === 'income' ? '+' : '-'} {formatCurrency(account.value)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 ml-4">
              <button
                onClick={() => onEdit(account)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar conta"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                title="Excluir conta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};