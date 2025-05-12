import React from 'react';
import { IncomeAnalysis } from './IncomeAnalysis';
import { SpendingBehavior } from './SpendingBehavior';
import { BalanceTrends } from './BalanceTrends';
import { CashFlowStability } from './CashFlowStability';
import { LoanAffordability } from './LoanAffordability';
import { RiskFlags } from './RiskFlags';
import { PieChartIcon } from 'lucide-react';
import { CollapsibleChat } from './CollapsibleChat';

interface FinancialData {
  income_analysis: {
    total_money_in: number;
    average_monthly_income: number;
    income_sources: {
      description_pattern: string;
      occurrences: number;
      average_amount: number;
    }[];
  };
  spending_behavior: {
    total_money_out: number;
    average_monthly_expenses: number;
    top_spending_categories: {
      category: string;
      total_spent: number;
    }[];
    high_ticket_transactions: {
      threshold: number;
      count: number;
    };
  };
  balance_trends: {
    opening_balance: number;
    closing_balance: number;
    average_monthly_balance: number;
    minimum_balance: number;
    overdraft_occurred: boolean;
  };
  cash_flow_stability: {
    net_cash_flow: number;
    positive_cash_flow: boolean;
    monthly_variability: {
      income_std_dev: number;
      expenses_std_dev: number;
    };
    irregular_activity: {
      type: string;
      month: string;
      details: string;
    }[];
  };
  loan_affordability_indicators: {
    estimated_disposable_income: number;
    months_of_expense_coverage: number;
    savings_behavior: string;
  };
  risk_flags: {
    frequent_low_balance: boolean;
    suspicious_transaction_patterns: {
      pattern: string;
      occurrences: number;
      flagged_as: string;
    }[];
    use_of_credit: {
      present: boolean;
    };
  };
}

interface DashboardProps {
  financialData: FinancialData;
  currency: string;
}

const Dashboard = ({ financialData, currency }: DashboardProps) => {
  return <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <PieChartIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800"> 
            Financial Insights Dashboard
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          Comprehensive analysis of financial health
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeAnalysis data={financialData.income_analysis} currency={currency} />
        </div>
        <div>
          <SpendingBehavior data={financialData.spending_behavior} currency={currency} />
        </div>
        <div>
          <BalanceTrends data={financialData.balance_trends} currency={currency} />
        </div>
        <div className="lg:col-span-2">
          <CashFlowStability data={financialData.cash_flow_stability} currency={currency} />
        </div>
        <div>
          <LoanAffordability data={financialData.loan_affordability_indicators} currency={currency} />
        </div>
        <div>
          <RiskFlags data={financialData.risk_flags} />
        </div>
        <CollapsibleChat />
      </div>
    </div>;
};
export default Dashboard;