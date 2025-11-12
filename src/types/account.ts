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
