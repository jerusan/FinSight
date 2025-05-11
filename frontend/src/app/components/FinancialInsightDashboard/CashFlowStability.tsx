import React from 'react';
import { Card } from './shared/Card';
import { formatCurrency } from '@/app/utils/formatters';
import { ArrowUpIcon, ArrowDownIcon, AlertTriangleIcon } from 'lucide-react';
interface IrregularActivity {
  type: string;
  month: string;
  details: string;
}
interface CashFlowStabilityProps {
  data: {
    net_cash_flow: number;
    positive_cash_flow: boolean;
    monthly_variability: {
      income_std_dev: number;
      expenses_std_dev: number;
    };
    irregular_activity: IrregularActivity[];
  };
  currency: string;
}
export const CashFlowStability = ({
  data,
  currency
}: CashFlowStabilityProps) => {
  return <Card title="Cash Flow Stability">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Net Cash Flow</p>
            <div className={`flex items-center font-medium ${data.positive_cash_flow ? 'text-green-600' : 'text-red-600'}`}>
              {data.positive_cash_flow ? <ArrowUpIcon size={16} className="mr-1" /> : <ArrowDownIcon size={16} className="mr-1" />}
              {formatCurrency(data.net_cash_flow, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Income Variability</p>
            <p className="font-medium text-gray-800">
              {data.monthly_variability.income_std_dev === 0 ? 'Stable' : 'Variable'}
            </p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Expense Variability</p>
            <p className="font-medium text-gray-800">
              {data.monthly_variability.expenses_std_dev > 0 ? `±${formatCurrency(data.monthly_variability.expenses_std_dev, currency)}` : 'Stable'}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">
            Irregular Activity
          </h3>
          {data.irregular_activity.length > 0 ? <div className="space-y-3">
              {data.irregular_activity.map((activity, index) => <div key={index} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <AlertTriangleIcon size={14} className="text-amber-500 mr-1.5" />
                    <p className="text-sm font-medium text-amber-800">
                      {activity.type} - {activity.month}
                    </p>
                  </div>
                  <p className="text-xs text-amber-700">{activity.details}</p>
                </div>)}
            </div> : <p className="text-sm text-gray-500">
              No irregular activities detected.
            </p>}
        </div>
      </div>
    </Card>;
};