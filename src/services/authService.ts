import { User } from '../types/user';
import { buildApiUrl, getDefaultHeaders } from '../config/api';


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;  
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token';

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      ...getDefaultHeaders(),
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {    
    try {        
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(credentials),
      });
      
      const authResponse = await this.handleResponse<AuthResponse>(response);
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(buildApiUrl('/user'), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(credentials),
      });
      
      const authResponse = await this.handleResponse<AuthResponse>(response);
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(buildApiUrl('/auth/me'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<User>(response);
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
      this.removeToken();    
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(buildApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      const authResponse = await this.handleResponse<AuthResponse>(response);
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      this.removeToken();
      throw error;
    }
  }
}