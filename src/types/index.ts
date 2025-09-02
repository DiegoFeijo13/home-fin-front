export interface Account {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  type: 'income' | 'expense';
  creditCard: string | null;
  inCreditCardStatement: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingAccounts: number;
  overdueAccounts: number;
  paidAccounts: number;
}