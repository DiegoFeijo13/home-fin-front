import { useState, useEffect } from 'react';
import { Account } from '../types';
import { AccountService } from '../services/accountService';

// Mock data for fallback
const mockAccounts: Account[] = [
  // Janeiro 2025
  {
    id: '1',
    description: 'Salário',
    value: 5000.00,
    dueDate: '2025-08-05T00:00:00.000Z',
    status: 'paid',
    category: 'Salário',
    type: 'income',
    creditCard: null,
    createdAt: '2024-12-05T00:00:00.000Z',
  },
  {
    id: '2',
    description: 'Freelance Design',
    value: 1200.00,
    dueDate: '2025-08-15T00:00:00.000Z',
    status: 'paid',
    category: 'Freelance',
    type: 'income',
    creditCard: null,
    createdAt: '2024-12-15T00:00:00.000Z',
  },
  {
    id: '3',
    description: 'Conta de luz',
    value: 150.50,
    dueDate: '2025-08-10T00:00:00.000Z',
    status: 'paid',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-10T00:00:00.000Z',
  },
  {
    id: '4',
    description: 'Supermercado',
    value: 320.75,
    dueDate: '2025-08-08T00:00:00.000Z',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-08T00:00:00.000Z',
  },
  {
    id: '5',
    description: 'Internet',
    value: 89.90,
    dueDate: '2025-08-20T00:00:00.000Z',
    status: 'paid',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-20T00:00:00.000Z',
  },
  {
    id: '6',
    description: 'Gasolina',
    value: 180.00,
    dueDate: '2025-08-12T00:00:00.000Z',
    status: 'paid',
    category: 'Transporte',
    type: 'expense',
    creditCard: 'Nubank Roxinho',
    createdAt: '2024-12-12T00:00:00.000Z',
  },

  // Fevereiro 2025
  {
    id: '7',
    description: 'Salário',
    value: 5000.00,
    dueDate: '2025-07-05T00:00:00.000Z',
    status: 'paid',
    category: 'Salário',
    type: 'income',
    creditCard: null,
    createdAt: '2025-07-05T00:00:00.000Z',
  },
  {
    id: '8',
    description: 'Freelance Design',
    value: 800.00,
    dueDate: '2025-07-18T00:00:00.000Z',
    status: 'paid',
    category: 'Freelance',
    type: 'income',
    creditCard: null,
    createdAt: '2025-01-18T00:00:00.000Z',
  },
  {
    id: '9',
    description: 'Venda de produto',
    value: 450.00,
    dueDate: '2025-07-22T00:00:00.000Z',
    status: 'paid',
    category: 'Vendas',
    type: 'income',
    creditCard: null,
    createdAt: '2025-07-22T00:00:00.000Z',
  },
  {
    id: '10',
    description: 'Conta de luz',
    value: 165.30,
    dueDate: '2025-07-10T00:00:00.000Z',
    status: 'paid',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: '11',
    description: 'Supermercado',
    value: 420.80,
    dueDate: '2025-07-14T00:00:00.000Z',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: null,
    createdAt: '2025-01-14T00:00:00.000Z',
  },
  {
    id: '12',
    description: 'Supermercado',
    value: 180.25,
    dueDate: '2025-07-28T00:00:00.000Z',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: null,
    createdAt: '2025-01-28T00:00:00.000Z',
  },
  {
    id: '13',
    description: 'Internet',
    value: 89.90,
    dueDate: '2025-07-20T00:00:00.000Z',
    status: 'paid',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2025-01-20T00:00:00.000Z',
  },
  {
    id: '14',
    description: 'Gasolina',
    value: 200.00,
    dueDate: '2025-07-15T00:00:00.000Z',
    status: 'paid',
    category: 'Transporte',
    type: 'expense',
    creditCard: 'Nubank Roxinho',
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: '15',
    description: 'Academia',
    value: 79.90,
    dueDate: '2025-07-25T00:00:00.000Z',
    status: 'paid',
    category: 'Saúde',
    type: 'expense',
    creditCard: null,
    createdAt: '2025-01-25T00:00:00.000Z',
  },

  // Janeiro 2025 (atual)
  {
    id: '16',
    description: 'Salário',
    value: 5000.00,
    dueDate: '2025-07-05T00:00:00.000Z',
    status: 'paid',
    category: 'Salário',
    type: 'income',
    creditCard: null,
    createdAt: '2024-12-05T00:00:00.000Z',
  },
  {
    id: '17',
    description: 'Freelance Design',
    value: 950.00,
    dueDate: '2025-06-20T00:00:00.000Z',
    status: 'pending',
    category: 'Freelance',
    type: 'income',
    creditCard: null,
    createdAt: '2024-12-20T00:00:00.000Z',
  },
  {
    id: '18',
    description: 'Conta de luz',
    value: 142.75,
    dueDate: '2025-06-10T00:00:00.000Z',
    status: 'pending',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-10T00:00:00.000Z',
  },
  {
    id: '19',
    description: 'Supermercado',
    value: 380.50,
    dueDate: '2025-06-12T00:00:00.000Z',
    status: 'paid',
    category: 'Alimentação',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-12T00:00:00.000Z',
  },
  {
    id: '20',
    description: 'Internet',
    value: 89.90,
    dueDate: '2025-06-20T00:00:00.000Z',
    status: 'overdue',
    category: 'Moradia',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-20T00:00:00.000Z',
  },
  {
    id: '21',
    description: 'Gasolina',
    value: 160.00,
    dueDate: '2025-06-18T00:00:00.000Z',
    status: 'paid',
    category: 'Transporte',
    type: 'expense',
    creditCard: 'Nubank Roxinho',
    createdAt: '2024-12-18T00:00:00.000Z',
  },
  {
    id: '22',
    description: 'Academia',
    value: 79.90,
    dueDate: '2025-06-25T00:00:00.000Z',
    status: 'pending',
    category: 'Saúde',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-25T00:00:00.000Z',
  },
  {
    id: '23',
    description: 'Plano de saúde',
    value: 280.00,
    dueDate: '2025-06-15T00:00:00.000Z',
    status: 'paid',
    category: 'Saúde',
    type: 'expense',
    creditCard: null,
    createdAt: '2024-12-15T00:00:00.000Z',
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