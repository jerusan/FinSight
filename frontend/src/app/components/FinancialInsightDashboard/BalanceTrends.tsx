import React from 'react';
import { Card } from './shared/Card';

import { AlertCircleIcon, ScaleIcon } from 'lucide-react';
import { formatCurrency } from '@/app/utils/formatters';
interface BalanceTrendsProps {
  data: {
    opening_balance: number;
    closing_balance: number;
    average_monthly_balance: number;
    minimum_balance: number;
    overdraft_occurred: boolean;
  };
  currency: string;
}
export const BalanceTrends = ({
  data,
  currency
}: BalanceTrendsProps) => {
  const balanceChange = data.closing_balance - data.opening_balance;
  const balanceChangePercent = (balanceChange / data.opening_balance * 100).toFixed(1);
  const isPositiveChange = balanceChange >= 0;
  return <Card title="Balance Trends">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Opening Balance</p>
          <p className="text-xl font-semibold text-gray-800">
            {formatCurrency(data.opening_balance, currency)}
          </p>
        </div>
        <div className="flex items-center">
          <ScaleIcon size={20} className="text-gray-400 mr-2" />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Closing Balance</p>
          <p className="text-xl font-semibold text-gray-800">
            {formatCurrency(data.closing_balance, currency)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Balance Change</p>
        <p className={`font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
          {isPositiveChange ? '+' : ''}
          {formatCurrency(balanceChange, currency)} ({isPositiveChange ? '+' : ''}
          {balanceChangePercent}%)
        </p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Average Monthly Balance</p>
        <p className="font-medium text-gray-800">
          {formatCurrency(data.average_monthly_balance, currency)}
        </p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">Minimum Balance</p>
        <p className="font-medium text-gray-800">{formatCurrency(data.minimum_balance, currency)}</p>
      </div>
      {data.overdraft_occurred && <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start">
          <AlertCircleIcon size={18} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Overdraft has occurred during this period. This may impact your
            credit score.
          </p>
        </div>}
    </Card>;
};