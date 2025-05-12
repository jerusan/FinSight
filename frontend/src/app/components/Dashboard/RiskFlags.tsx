import React from 'react';
import { Card } from './shared/Card';
import { AlertTriangleIcon, AlertOctagonIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
interface SuspiciousPattern {
  pattern: string;
  occurrences: number;
  flagged_as: string;
}
interface RiskFlagsProps {
  data: {
    frequent_low_balance: boolean;
    suspicious_transaction_patterns: SuspiciousPattern[];
    use_of_credit: {
      present: boolean;
    };
  };
}
export const RiskFlags = ({
  data
}: RiskFlagsProps) => {
  const riskLevel = data.frequent_low_balance && data.suspicious_transaction_patterns.length > 0 && data.use_of_credit.present ? 'high' : data.frequent_low_balance || data.suspicious_transaction_patterns.length > 0 || data.use_of_credit.present ? 'medium' : 'low';
  const riskColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-green-100 text-green-800'
  };
  const riskIcons = {
    high: <AlertOctagonIcon size={18} className="text-red-500" />,
    medium: <AlertTriangleIcon size={18} className="text-amber-500" />,
    low: <CheckCircleIcon size={18} className="text-green-500" />
  };
  return <Card title="Risk Flags">
      <div className={`${riskColors[riskLevel]} rounded-lg p-3 flex items-center mb-5`}>
        <div className="mr-3">{riskIcons[riskLevel]}</div>
        <div>
          <p className="font-medium text-sm">
            {riskLevel === 'high' ? 'High Risk Profile' : riskLevel === 'medium' ? 'Medium Risk Profile' : 'Low Risk Profile'}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          {data.frequent_low_balance ? <XCircleIcon size={16} className="text-red-500 mr-2" /> : <CheckCircleIcon size={16} className="text-green-500 mr-2" />}
          <p className="text-sm text-gray-800">
            {data.frequent_low_balance ? 'Frequent low balance detected' : 'No frequent low balance'}
          </p>
        </div>
        <div className="flex items-center">
          {data.use_of_credit.present ? <CreditCardIcon size={16} className="text-amber-500 mr-2" /> : <CheckCircleIcon size={16} className="text-green-500 mr-2" />}
          <p className="text-sm text-gray-800">
            {data.use_of_credit.present ? 'Use of credit detected' : 'No credit usage detected'}
          </p>
        </div>
        {data.suspicious_transaction_patterns.length > 0 && <div>
            <div className="flex items-center mb-2">
              <AlertTriangleIcon size={16} className="text-amber-500 mr-2" />
              <p className="text-sm font-medium text-gray-800">
                Suspicious patterns detected
              </p>
            </div>
            {data.suspicious_transaction_patterns.map((pattern, index) => <div key={index} className="ml-6 mb-2">
                <p className="text-xs text-gray-600">
                  {pattern.pattern} ({pattern.occurrences} occurrences)
                </p>
                <p className="text-xs text-gray-500">{pattern.flagged_as}</p>
              </div>)}
          </div>}
      </div>
    </Card>;
};