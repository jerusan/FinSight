import React from 'react';
import { Card } from './shared/Card';
import { formatCurrency } from '@/app/utils/formatters';
import { WalletIcon, CalendarIcon, PiggyBankIcon } from 'lucide-react';
interface LoanAffordabilityProps {
  data: {
    estimated_disposable_income: number;
    months_of_expense_coverage: number;
    savings_behavior: string;
  };
  currency: string;
}
export const LoanAffordability = ({
  data,
  currency
}: LoanAffordabilityProps) => {
  const coverageLevel = data.months_of_expense_coverage < 1 ? 'low' : data.months_of_expense_coverage < 3 ? 'medium' : 'high';
  const coverageColors = {
    low: 'text-red-600',
    medium: 'text-amber-600',
    high: 'text-green-600'
  };
  return <Card title="Loan Affordability">
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-4">
            <WalletIcon size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Disposable Income</p>
            <p className="text-lg font-medium text-gray-800">
              {formatCurrency(data.estimated_disposable_income, currency)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-4">
            <CalendarIcon size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expense Coverage</p>
            <div className="flex items-baseline">
              <p className={`text-lg font-medium ${coverageColors[coverageLevel]}`}>
                {data.months_of_expense_coverage.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 ml-1">months</p>
            </div>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-0.5">
            <PiggyBankIcon size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Savings Behavior</p>
            <p className="text-sm text-gray-800">{data.savings_behavior}</p>
          </div>
        </div>
      </div>
    </Card>;
};