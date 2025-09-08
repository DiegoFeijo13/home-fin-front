import React, { useMemo } from 'react';
import { Calendar, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { Account } from '../types';

interface MonthlyReportProps {
  accounts: Account[];
}

interface MonthlyData {
  [description: string]: {
    [monthKey: string]: number;
  };
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ accounts }) => {
  const { incomeData, expenseData, months, incomeTotals, expenseTotals, balanceTotals } = useMemo(() => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Filtrar contas dos últimos 3 meses
    const filteredAccounts = accounts.filter(account => {
      const dueDate = new Date(account.dueDate);
      return dueDate >= threeMonthsAgo;
    });

    // Gerar lista dos últimos 3 meses
    const monthsList: string[] = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsList.push(monthKey);
    }

    // Separar receitas e despesas
    const incomeAccounts = filteredAccounts.filter(account => account.type === 'income');
    const expenseAccounts = filteredAccounts.filter(account => account.type === 'expense');

    // Função para agrupar contas por descrição e mês
    const groupAccountsByMonth = (accountsList: Account[]): MonthlyData => {
      const grouped: MonthlyData = {};
      
      accountsList.forEach(account => {
        const dueDate = new Date(account.dueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grouped[account.description]) {
          grouped[account.description] = {};
        }
        
        if (!grouped[account.description][monthKey]) {
          grouped[account.description][monthKey] = 0;
        }
        
        grouped[account.description][monthKey] += account.value;
      });

      return grouped;
    };

    // Agrupar receitas e despesas
    const groupedIncome = groupAccountsByMonth(incomeAccounts);
    const groupedExpenses = groupAccountsByMonth(expenseAccounts);

    // Calcular totais mensais
    const incomeMonthTotals: { [monthKey: string]: number } = {};
    const expenseMonthTotals: { [monthKey: string]: number } = {};
    const balanceMonthTotals: { [monthKey: string]: number } = {};

    monthsList.forEach(month => {
      // Total de receitas do mês
      incomeMonthTotals[month] = Object.values(groupedIncome).reduce((sum, monthData) => {
        return sum + (monthData[month] || 0);
      }, 0);

      // Total de despesas do mês
      expenseMonthTotals[month] = Object.values(groupedExpenses).reduce((sum, monthData) => {
        return sum + (monthData[month] || 0);
      }, 0);

      // Saldo do mês (receitas - despesas)
      balanceMonthTotals[month] = incomeMonthTotals[month] - expenseMonthTotals[month];
    });

    return {
      incomeData: groupedIncome,
      expenseData: groupedExpenses,
      months: monthsList,
      incomeTotals: incomeMonthTotals,
      expenseTotals: expenseMonthTotals,
      balanceTotals: balanceMonthTotals
    };
  }, [accounts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    }).replace('.', '');
  };

  const incomeDescriptions = Object.keys(incomeData).sort();
  const expenseDescriptions = Object.keys(expenseData).sort();

  // Componente para renderizar tabela
  const DataTable: React.FC<{
    title: string;
    data: MonthlyData;
    descriptions: string[];
    totals: { [monthKey: string]: number };
    type: 'income' | 'expense';
    icon: React.ReactNode;
  }> = ({ title, data, descriptions, totals, type, icon }) => {
    if (descriptions.length === 0) {
      return (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">{icon}</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma {type === 'income' ? 'receita' : 'despesa'} encontrada</h3>
          <p className="text-gray-500">Não há {type === 'income' ? 'receitas' : 'despesas'} registradas nos últimos três meses.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                  Descrição
                </th>
                {months.map(month => (
                  <th key={month} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[120px]">
                    {formatMonthHeader(month)}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {descriptions.map((description, index) => {
                const rowTotal = months.reduce((sum, month) => {
                  return sum + (data[description][month] || 0);
                }, 0);

                return (
                  <tr key={description} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {description}
                    </td>
                    {months.map(month => {
                      const value = data[description][month] || 0;
                      return (
                        <td key={month} className="px-4 py-4 text-center text-sm">
                          {value > 0 ? (
                            <span className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(value)}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center text-sm font-semibold">
                      <span className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(rowTotal)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  Total por Mês
                </td>
                {months.map(month => (
                  <td key={month} className="px-4 py-4 text-center text-sm font-bold">
                    <span className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(totals[month] || 0)}
                    </span>
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold">
                  <span className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Object.values(totals).reduce((sum, value) => sum + value, 0))}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const totalIncome = Object.values(incomeTotals).reduce((sum, value) => sum + value, 0);
  const totalExpenses = Object.values(expenseTotals).reduce((sum, value) => sum + value, 0);
  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Receitas</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-5 h-5 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contas Únicas</p>
              <p className="text-xl font-bold text-gray-900">{incomeDescriptions.length + expenseDescriptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Saldo Mensal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Saldo Mensal</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                  Tipo
                </th>
                {months.map(month => (
                  <th key={month} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[120px]">
                    {formatMonthHeader(month)}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-white">
                <td className="px-6 py-4 text-sm font-medium text-green-600">Receitas</td>
                {months.map(month => (
                  <td key={month} className="px-4 py-4 text-center text-sm font-medium text-green-600">
                    {formatCurrency(incomeTotals[month] || 0)}
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4 text-sm font-medium text-red-600">Despesas</td>
                {months.map(month => (
                  <td key={month} className="px-4 py-4 text-center text-sm font-medium text-red-600">
                    {formatCurrency(expenseTotals[month] || 0)}
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Saldo</td>
                {months.map(month => (
                  <td key={month} className="px-4 py-4 text-center text-sm font-bold">
                    <span className={balanceTotals[month] >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(balanceTotals[month] || 0)}
                    </span>
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold">
                  <span className={totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(totalBalance)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tabela de Receitas */}
      <DataTable
        title="Receitas"
        data={incomeData}
        descriptions={incomeDescriptions}
        totals={incomeTotals}
        type="income"
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
      />

      {/* Tabela de Despesas */}
      <DataTable
        title="Despesas"
        data={expenseData}
        descriptions={expenseDescriptions}
        totals={expenseTotals}
        type="expense"
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
      />
    </div>
  );
};