import React, { useState, useMemo } from 'react';
import { Users, Calculator, Check, X, DollarSign, Share2, Download } from 'lucide-react';
import { Account } from '../types';
import html2canvas from 'html2canvas';

interface ExpenseSharingReportProps {
  accounts: Account[];
}

interface SelectedAccount {
  account: Account;
  peopleCount: number;
}

export const ExpenseSharingReport: React.FC<ExpenseSharingReportProps> = ({ accounts }) => {
  const [selectedAccounts, setSelectedAccounts] = useState<Map<string, SelectedAccount>>(new Map());
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Filtrar apenas despesas
  const expenseAccounts = useMemo(() => {
    return accounts.filter(account => account.type === 'expense');
  }, [accounts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    const utcDate = new Date(date);
    return utcDate.toLocaleDateString('pt-BR', {
      timeZone: 'UTC'
    });
  };

  const handleAccountToggle = (account: Account) => {
    const newSelected = new Map(selectedAccounts);
    
    if (newSelected.has(account.id)) {
      newSelected.delete(account.id);
    } else {
      newSelected.set(account.id, {
        account,
        peopleCount: 2, // Valor padrão: dividir entre 2 pessoas
      });
    }
    
    setSelectedAccounts(newSelected);
  };

  const handlePeopleCountChange = (accountId: string, peopleCount: number) => {
    const newSelected = new Map(selectedAccounts);
    const selectedAccount = newSelected.get(accountId);
    
    if (selectedAccount && peopleCount >= 1) {
      newSelected.set(accountId, {
        ...selectedAccount,
        peopleCount,
      });
      setSelectedAccounts(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedAccounts(new Map());
  };

  const shareAsImage = async () => {
    const tableElement = document.getElementById('sharing-results-table');
    if (!tableElement || selectedAccounts.size === 0) return;

    setIsGeneratingImage(true);
    
    try {
      const canvas = await html2canvas(tableElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      // Converter para blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `divisao-contas-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Calcular totais
  const totals = useMemo(() => {
    const selectedAccountsList = Array.from(selectedAccounts.values());
    
    const totalOriginal = selectedAccountsList.reduce((sum, item) => sum + item.account.value, 0);
    const totalDivided = selectedAccountsList.reduce((sum, item) => sum + (item.account.value / item.peopleCount), 0);
    
    return {
      totalOriginal,
      totalDivided,
      accountsCount: selectedAccountsList.length,
    };
  }, [selectedAccounts]);

  if (expenseAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa encontrada</h3>
        <p className="text-gray-500">Adicione algumas despesas para usar o relatório de divisão de contas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contas Selecionadas</p>
              <p className="text-xl font-bold text-gray-900">{totals.accountsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totals.totalOriginal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sua Parte</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalDivided)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de Contas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Despesas para Divisão</h3>
            </div>
            {selectedAccounts.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={shareAsImage}
                  disabled={isGeneratingImage}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Baixar PNG
                    </>
                  )}
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar Seleção
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {expenseAccounts.map((account) => {
              const isSelected = selectedAccounts.has(account.id);
              const selectedAccount = selectedAccounts.get(account.id);

              return (
                <div
                  key={account.id}
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAccountToggle(account)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{account.description}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{account.category}</span>
                          <span>{formatDate(account.dueDate)}</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(account.value)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 text-sm">
                        <label className="font-medium text-gray-700">
                          Dividir entre:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={selectedAccount?.peopleCount || 2}
                          onChange={(e) => handlePeopleCountChange(account.id, parseInt(e.target.value) || 1)}
                          className="w-12 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">pessoas</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      {selectedAccounts.size > 0 && (
        <div id="sharing-results-table" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Resultado da Divisão</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">
                    Descrição
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">
                    Data
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">
                    Pessoas
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">
                    Valor Total
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">
                    Sua Parte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from(selectedAccounts.values()).map((item, index) => {
                  const dividedValue = item.account.value / item.peopleCount;

                  return (
                    <tr key={item.account.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">
                        <div>
                          <div className="font-medium">{item.account.description}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.account.category}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-600">
                        {formatDate(item.account.dueDate)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-blue-600">
                        {item.peopleCount}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-red-600">
                        {formatCurrency(item.account.value)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-green-600">
                        {formatCurrency(dividedValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-gray-900">
                    Total ({totals.accountsCount} contas)
                  </td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-red-600">
                    {formatCurrency(totals.totalOriginal)}
                  </td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-green-600">
                    {formatCurrency(totals.totalDivided)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};