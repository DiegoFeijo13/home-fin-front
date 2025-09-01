import { useState, useEffect } from 'react';
import { Account } from '../types';

// Mock data - Em produção, isso viria da API
const mockAccounts: Account[] = [
  {
    id: '1',
    description: 'Salário mensal',
    value: 5000,
    dueDate: '2025-01-05',
    status: 'paid',
    category: 'Salário',
    type: 'income',
    creditCard: null,
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: '2',
    description: 'Aluguel do apartamento',
    value: 1200,
    dueDate: '2025-01-10',
    status: 'pending',
    category: 'Moradia',
    type: 'expense',
    creditCard: 'Nubank Roxinho',
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: '3',
    description: 'Conta de energia elétrica',
    value: 180,
    dueDate: '2024-12-25',
    status: 'overdue',
    category: 'Utilities',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-01T08:00:00Z',
  },
  {
    id: '4',
    description: 'Freelance desenvolvimento web',
    value: 2500,
    dueDate: '2025-01-15',
    status: 'pending',
    category: 'Freelance',
    type: 'income',
    creditCard: null,
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: '5',
    description: 'Supermercado - compras do mês',
    value: 450,
    dueDate: '2025-01-08',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: 'Itaú Click',
    createdAt: '2025-01-01T08:00:00Z',
  },
];

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento da API
    const fetchAccounts = async () => {
      setLoading(true);
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccounts(mockAccounts);
      setLoading(false);
    };

    fetchAccounts();
  }, []);

  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Simula chamada para API
    await new Promise(resolve => setTimeout(resolve, 500));
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = async (id: string, accountData: Omit<Account, 'id' | 'createdAt'>) => {
    // Simula chamada para API
    await new Promise(resolve => setTimeout(resolve, 500));
    setAccounts(prev =>
      prev.map(account =>
        account.id === id
          ? { ...account, ...accountData }
          : account
      )
    );
  };

  const deleteAccount = async (id: string) => {
    // Simula chamada para API
    await new Promise(resolve => setTimeout(resolve, 500));
    setAccounts(prev => prev.filter(account => account.id !== id));
  };

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
  };
};