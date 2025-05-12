import React from 'react';
import { Card } from './shared/Card';
import { DataCard } from './shared/DataCard';
import { formatCurrency } from '@/app/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDownIcon, CreditCardIcon } from 'lucide-react';
interface SpendingCategory {
  category: string;
  total_spent: number;
}
interface SpendingBehaviorProps {
  data: {
    total_money_out: number;
    average_monthly_expenses: number;
    top_spending_categories: SpendingCategory[];
    high_ticket_transactions: {
      threshold: number;
      count: number;
    };
  };
  currency: string;
}
export const SpendingBehavior = ({
  data,
  currency
}: SpendingBehaviorProps) => {
  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
  const chartData = data.top_spending_categories.map(category => ({
    name: category.category,
    value: category.total_spent
  }));
  return <Card title="Spending Behavior">
      <div className="grid grid-cols-1 gap-4 mb-6">
        <DataCard label="Total Money Out" value={formatCurrency(data.total_money_out, currency)} icon={<TrendingDownIcon size={20} />} trend="down" />
        <DataCard label="Monthly Expenses" value={formatCurrency(data.average_monthly_expenses, currency)} icon={<CreditCardIcon size={20} />} trend="down" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">
          Top Spending Categories
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={value => formatCurrency(Number(value), currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>;
};