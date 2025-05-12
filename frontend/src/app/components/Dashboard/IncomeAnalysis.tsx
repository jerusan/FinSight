import React from 'react';
import { Card } from './shared/Card';
import { DataCard } from './shared/DataCard';
import { formatCurrency } from '@/app/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUpIcon, WalletIcon } from 'lucide-react';
interface IncomeSource {
  description_pattern: string;
  occurrences: number;
  average_amount: number;
}
interface IncomeAnalysisProps {
  data: {
    total_money_in: number;
    average_monthly_income: number;
    income_sources: IncomeSource[];
  };
  currency: string;
}
export const IncomeAnalysis = ({
  data,
  currency
}: IncomeAnalysisProps) => {
  const chartData = data.income_sources.map(source => ({
    name: source.description_pattern.replace(/^.{15}/, match => match + '...'),
    value: source.average_amount * source.occurrences
  }));
  return <Card title="Income Analysis">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DataCard label="Total Money In" value={formatCurrency(data.total_money_in, currency)} icon={<WalletIcon size={20} />} trend="up" />
        <DataCard label="Average Monthly Income" value={formatCurrency(data.average_monthly_income, currency)} icon={<TrendingUpIcon size={20} />} trend="neutral" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">
          Income Sources
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{
              fontSize: 12
            }} />
              <YAxis tickFormatter={value => `${formatCurrency(Number(value), currency)}`} tick={{
              fontSize: 12
            }} />
              <Tooltip formatter={value => [`${formatCurrency(Number(value), currency)}`, 'Amount']} labelStyle={{
              color: '#111'
            }} contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ddd'
            }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>;
};