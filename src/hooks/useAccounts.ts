import { useState, useEffect } from 'react';
import { Account } from '../types';
import { AccountService } from '../services/accountService';

// Mock data for fallback
const mockAccounts: Account[] = [
  {
    id: '1',
    description: 'Conta de luz',
    value: 150.50,
    dueDate: '2024-02-15',
    status: 'pending',
    category: 'Moradia',
    type: 'expense',
    creditCard: 'Nubank Roxinho',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    description: 'Salário',
    value: 5000.00,
    dueDate: '2024-02-01',
    status: 'paid',
    category: 'Salário',
    type: 'income',
    creditCard: '',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    description: 'Supermercado',
    value: 320.75,
    dueDate: '2024-02-10',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: 'Itaú Click',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    description: 'Internet',
    value: 89.90,
    dueDate: '2024-02-20',
    status: 'overdue',
    category: 'Moradia',
    type: 'expense',
    creditCard: 'C6 Bank',
    createdAt: '2024-01-20',
  },
];

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApi, setUseApi] = useState(true);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [useApi]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    
    if (!useApi) {
      setAccounts(mockAccounts);
      setLoading(false);
      return;
    }

    try {
      const data = await AccountService.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.warn('API not available, using mock data:', err);
      setAccounts(mockAccounts);
      setUseApi(false);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    if (!useApi) {
      const newAccount: Account = {
        ...accountData,
        id: Date.now().toString(),
        createdAt: Date.now().toString(),
      };
      setAccounts(prev => [...prev, newAccount]);
      return;
    }

    try {
      const newAccount = await AccountService.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
    } catch (err) {
      setError('Erro ao adicionar conta');
      console.error('Error adding account:', err);
    }
  };

  const updateAccount = async (id: string, accountData: Omit<Account, 'id' | 'createdAt'>) => {
    if (!useApi) {
      setAccounts(prev => prev.map(account => 
        account.id === id 
          ? { ...account, ...accountData }
          : account
      ));
      return;
    }

    try {
      const updatedAccount = await AccountService.updateAccount(id, accountData);      
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
    } catch (err) {
      setError('Erro ao atualizar conta');
      console.error('Error updating account:', err);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!useApi) {
      setAccounts(prev => prev.filter(account => account.id !== id));
      return;
    }

    try {
      await AccountService.deleteAccount(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      setError('Erro ao deletar conta');
      console.error('Error deleting account:', err);
    }
  };

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: loadAccounts,
    isUsingApi: useApi,
  };
};