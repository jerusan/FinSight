from pydantic import BaseModel
from typing import List, Optional

class TransactionModel(BaseModel):
    date: str
    description: str
    credit: float
    debit: float
    balance: float

class BankStatement(BaseModel):
    filename: str
    account_number: str
    period_start: str
    period_end: str
    opening_balance: Optional[float]
    closing_balance: Optional[float]
    money_in: Optional[float]
    money_out: Optional[float]
    currency: Optional[str]
    transactions: List[TransactionModel]

class FlaggedTransaction(BaseModel):
    index: int
    issue: str
    transaction: Optional[TransactionModel] = None
    previous_balance: Optional[float] = None
    current_balance: Optional[float] = None

class AnalysisResponse(BaseModel):
    summary: BankStatement
    flagged: List[FlaggedTransaction]

class FinalizedStatementRequest(BaseModel):
    summary: BankStatement
    finalizedTransactions: List[TransactionModel]

class IncomeSource(BaseModel):
    description_pattern: str
    occurrences: int
    average_amount: float


class TopSpendingCategory(BaseModel):
    category: str
    total_spent: float


class HighTicketTransactions(BaseModel):
    threshold: float
    count: int


class IncomeAnalysis(BaseModel):
    total_money_in: float
    average_monthly_income: float
    income_sources: List[IncomeSource]


class SpendingBehavior(BaseModel):
    total_money_out: float
    average_monthly_expenses: float
    top_spending_categories: List[TopSpendingCategory]
    high_ticket_transactions: HighTicketTransactions


class BalanceTrends(BaseModel):
    opening_balance: float
    closing_balance: float
    average_monthly_balance: float
    minimum_balance: float
    overdraft_occurred: bool


class MonthlyVariability(BaseModel):
    income_std_dev: float
    expenses_std_dev: float


class IrregularActivity(BaseModel):
    type: str
    month: str
    details: str


class CashFlowStability(BaseModel):
    net_cash_flow: float
    positive_cash_flow: bool
    monthly_variability: MonthlyVariability
    irregular_activity: List[IrregularActivity]


class LoanAffordabilityIndicators(BaseModel):
    estimated_disposable_income: float
    months_of_expense_coverage: float
    savings_behavior: str


class SuspiciousTransactionPattern(BaseModel):
    pattern: str
    occurrences: int
    flagged_as: str


class UseOfCredit(BaseModel):
    present: bool


class RiskFlags(BaseModel):
    frequent_low_balance: bool
    suspicious_transaction_patterns: List[SuspiciousTransactionPattern]
    use_of_credit: UseOfCredit


class AnalysisResult(BaseModel):
    income_analysis: IncomeAnalysis
    spending_behavior: SpendingBehavior
    balance_trends: BalanceTrends
    cash_flow_stability: CashFlowStability
    loan_affordability_indicators: LoanAffordabilityIndicators
    risk_flags: RiskFlags

class ChatResponse(BaseModel):
    answer: str
    
class ChatRequest(BaseModel):
    question: str