import { Account } from '../types';
import { API_CONFIG, buildApiUrl } from '../config/api';
import { AuthService } from './authService';

export class AccountService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  private static getAuthHeaders(): HeadersInit {
    return AuthService.getAuthHeaders();
  }

  static async getAccounts(): Promise<Account[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.endpoints.accounts), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });      
      return this.handleResponse<Account[]>(response);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  }

  static async createAccount(accountData: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.endpoints.accounts), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData),
      });
      return this.handleResponse<Account>(response);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  }

  static async updateAccount(id: string, accountData: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.endpoints.accounts}/${id}`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData),
      });
      return this.handleResponse<Account>(response);
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw error;
    }
  }

  static async deleteAccount(id: string): Promise<void> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.endpoints.accounts}/${id}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  }

  // Aliases para manter compatibilidade
  static getAll = this.getAccounts;
  static create = this.createAccount;
  static update = this.updateAccount;
  static delete = this.deleteAccount;
}