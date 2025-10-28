export interface Account {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  type: 'income' | 'expense';
  creditCard: string | null;
  createdAt: string;
  // Campos opcionais para criação de contas recorrentes
  isRecurring?: boolean;
  recurringMonths?: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingAccounts: number;
  overdueAccounts: number;
  paidAccounts: number;
}

export interface User {  
  name: string;
  username: string;  
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}