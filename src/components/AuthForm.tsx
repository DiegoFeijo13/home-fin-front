import React, { useState } from 'react';
import { LogIn, UserPlus, Tag, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import { LoginCredentials, RegisterCredentials } from '../services/authService';

interface AuthFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, isLoading }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',    
    userTag: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.userTag || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!isLoginMode && !formData.name) {
      setError('Por favor, preencha seu nome');
      return;
    }

    // Validação de usuário
    if (formData.userTag.length < 3) {
      setError('O usuário deve ter pelo menos 3 caracteres');
      return;
    }

    // Validação de senha
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      if (isLoginMode) {
        await onLogin({
          username: formData.userTag,
          password: formData.password,
        });
      } else {
        await onRegister({
          name: formData.name,  
          username: formData.userTag,        
          password: formData.password,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setFormData({ name: '', userTag: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="p-3 bg-blue-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {isLoginMode ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoginMode ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-gray-600">
            {isLoginMode 
              ? 'Acesse seu controle financeiro' 
              : 'Comece a organizar suas finanças'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Seu nome completo"
                  disabled={isLoading}
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Usuário *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="userTag"
                name="userTag"
                value={formData.userTag}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="usuario123"
                disabled={isLoading}
                required
              />
            </div>
            {!isLoginMode && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 3 caracteres
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Sua senha"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isLoginMode && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isLoginMode ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              <>
                {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLoginMode ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <button
            onClick={toggleMode}
            disabled={isLoading}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {isLoginMode ? 'Criar nova conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};