import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Account } from '../types/account';

interface AccountFormProps {
  account?: Account;
  onSave: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ account, onSave, onCancel }) => {

  // Converter data UTC para formato de input date (YYYY-MM-DD)
  const formatDateForInput = (utcDate: string): string => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    return date.toISOString().split('T')[0];
  };

  // Converter data do input para UTC
  const formatDateToUTC = (inputDate: string): string => {
    if (!inputDate) return '';
    const date = new Date(inputDate + 'T00:00:00.000Z');
    return date.toISOString();
  };

  // Formatar valor monetário
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo que não é número
    const cleanValue = value.replace(/\D/g, '');

    if (!cleanValue) return '';

    // Converte para centavos
    const cents = parseInt(cleanValue);

    // Converte de volta para reais com vírgula
    const reais = cents / 100;

    return reais.toFixed(2).replace('.', ',');
  };

  // Converter valor formatado para número
  const parseFormattedValue = (formattedValue: string): number => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(',', '.')) || 0;
  };

  const [formData, setFormData] = useState({
    id: account?.id || null,
    description: account?.description || '',
    value: account?.value ? formatCurrencyInput((account.value * 100).toString()) : '',
    dueDate: account?.dueDate ? formatDateForInput(account.dueDate) : '',
    status: account?.status || 'pending' as const,
    category: account?.category || '',
    type: account?.type || 'expense' as const,
    creditCard: account?.creditCard || null,
    isRecurring: false,
    recurringMonths: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrencyInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      value: formattedValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.value || !formData.dueDate || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.isRecurring && formData.recurringMonths < 1) {
      alert('O número de meses deve ser pelo menos 1');
      return;
    }

    // Converter dados para o formato esperado
    const accountData = {
      ...formData,
      value: parseFormattedValue(formData.value),
      dueDate: formatDateToUTC(formData.dueDate),
    };

    onSave(accountData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {account ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Descrição da conta"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleValueChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Ex: Alimentação, Moradia, Salário"
                required
              />
            </div>

            <div>
              <label htmlFor="creditCard" className="block text-sm font-medium text-gray-700 mb-2">
                Cartão de Crédito
              </label>
              <select
                id="creditCard"
                name="creditCard"
                value={formData.creditCard || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">Nenhum cartão</option>
                <option value="Nubank Roxinho">Nubank Roxinho</option>
                <option value="Itaú Click">Itaú Click</option>
                <option value="Bradesco Elo">Bradesco Elo</option>
                <option value="Santander SX">Santander SX</option>
                <option value="C6 Bank">C6 Bank</option>
                <option value="Inter Gold">Inter Gold</option>
                <option value="XP Visa Infinite">XP Visa Infinite</option>
              </select>
            </div>

            {!account && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Criar conta recorrente para os próximos meses
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div>
                    <label htmlFor="recurringMonths" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de meses (incluindo o atual)
                    </label>
                    <input
                      type="number"
                      id="recurringMonths"
                      name="recurringMonths"
                      value={formData.recurringMonths}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Ex: 3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Será criada {formData.recurringMonths} conta{formData.recurringMonths > 1 ? 's' : ''} 
                      {formData.recurringMonths > 1 ? ` (atual + ${formData.recurringMonths - 1} próximos meses)` : ' (apenas o mês atual)'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};