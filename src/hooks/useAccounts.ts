import { useState, useEffect } from 'react';
import { Account } from '../types/account';
import { AccountService } from '../services/accountService';
import { useAuth } from './useAuth';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [authState.user?.username]);

  // Reset accounts when user logs out
  useEffect(() => {
    if(!authState.isAuthenticated){
      setAccounts([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated])

  const loadAccounts = async () => {
    if(!authState.isAuthenticated){
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AccountService.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.warn('API not available:', err);      
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    try {
      const newAccount = await AccountService.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
    } catch (err) {
      setError('Erro ao adicionar conta');
      console.error('Error adding account:', err);
    }
  };

  const updateAccount = async (id: string, accountData: Omit<Account, 'id' | 'createdAt'>) => {
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
    refreshAccounts: loadAccounts    
  };
};