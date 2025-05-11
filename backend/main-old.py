# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional, Union
# import shutil
# import os
# from dotenv import load_dotenv
# from math import isclose
# from dateutil import parser
# from extract_thinker import Extractor, DocumentLoaderPdfPlumber
# import logging
# from pydantic import BaseModel
# from typing import List, Optional
# import asyncio
# from openai import AsyncOpenAI
# import json

# openAIClient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # Load environment variables
# load_dotenv()

# # --- FastAPI App Setup ---
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # --- Data Models ---

# class TransactionModel(BaseModel):
#     date: str
#     description: str
#     credit: float
#     debit: float
#     balance: float

# class BankStatement(BaseModel):
#     filename: str
#     account_number: str
#     period_start: str
#     period_end: str
#     opening_balance: Optional[float]
#     closing_balance: Optional[float]
#     money_in: Optional[float]
#     money_out: Optional[float]
#     currency: Optional[str]
#     transactions: List[TransactionModel]

# class FlaggedTransaction(BaseModel):
#     index: int
#     issue: str
#     transaction: Optional[TransactionModel] = None
#     previous_balance: Optional[float] = None
#     current_balance: Optional[float] = None

# class AnalysisResponse(BaseModel):
#     summary: BankStatement
#     flagged: List[FlaggedTransaction]

# class FinalizedStatementRequest(BaseModel):
#     summary: BankStatement
#     finalizedTransactions: List[TransactionModel]

# class IncomeSource(BaseModel):
#     description_pattern: str
#     occurrences: int
#     average_amount: float


# class TopSpendingCategory(BaseModel):
#     category: str
#     total_spent: float


# class HighTicketTransactions(BaseModel):
#     threshold: float
#     count: int


# class IncomeAnalysis(BaseModel):
#     total_money_in: float
#     average_monthly_income: float
#     income_sources: List[IncomeSource]


# class SpendingBehavior(BaseModel):
#     total_money_out: float
#     average_monthly_expenses: float
#     top_spending_categories: List[TopSpendingCategory]
#     high_ticket_transactions: HighTicketTransactions


# class BalanceTrends(BaseModel):
#     opening_balance: float
#     closing_balance: float
#     average_monthly_balance: float
#     minimum_balance: float
#     overdraft_occurred: bool


# class MonthlyVariability(BaseModel):
#     income_std_dev: float
#     expenses_std_dev: float


# class IrregularActivity(BaseModel):
#     type: str
#     month: str
#     details: str


# class CashFlowStability(BaseModel):
#     net_cash_flow: float
#     positive_cash_flow: bool
#     monthly_variability: MonthlyVariability
#     irregular_activity: List[IrregularActivity]


# class LoanAffordabilityIndicators(BaseModel):
#     estimated_disposable_income: float
#     months_of_expense_coverage: float
#     savings_behavior: str


# class SuspiciousTransactionPattern(BaseModel):
#     pattern: str
#     occurrences: int
#     flagged_as: str


# class UseOfCredit(BaseModel):
#     present: bool


# class RiskFlags(BaseModel):
#     frequent_low_balance: bool
#     suspicious_transaction_patterns: List[SuspiciousTransactionPattern]
#     use_of_credit: UseOfCredit


# class AnalysisResult(BaseModel):
#     income_analysis: IncomeAnalysis
#     spending_behavior: SpendingBehavior
#     balance_trends: BalanceTrends
#     cash_flow_stability: CashFlowStability
#     loan_affordability_indicators: LoanAffordabilityIndicators
#     risk_flags: RiskFlags


# # --- Routes ---

# @app.get("/", response_model=dict)
# async def root() -> dict:
#     return {"message": "Bank Statement Analysis API"}

# @app.post("/finalize-statement/", response_model=AnalysisResult)
# async def finalize_statement(data: FinalizedStatementRequest) -> AnalysisResult:
#     print("Finalized statement:", data)

#     res = await parse_with_assistant(data)
#     print("Financial data", res)

#     return AnalysisResult(**json.loads(res))

# @app.post("/upload-statement/", response_model=AnalysisResponse)
# async def upload_bank_statement(file: UploadFile = File(...)) -> Union[AnalysisResponse, JSONResponse]:
#     if not file.filename.endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Only PDF files are supported.")

#     file_location = os.path.join(UPLOAD_DIR, file.filename)
#     try:
#         with open(file_location, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
#         logging.info("File saved successfully: %s", file.filename)

#         statement_summary = await extract(file_location)
#         statement_summary.filename = file.filename

#         flagged = flag_inconsistencies(statement_summary)
#         print("Flagged transactions:", flagged)
#         return AnalysisResponse(
#             summary=statement_summary,
#             flagged=flagged
#         )
#     except Exception as e:
#         logging.error("Error processing file: %s", e)
#         raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")

# def flag_inconsistencies(statement: BankStatement) -> List[FlaggedTransaction]:
#     transactions = statement.transactions
#     opening_balance = statement.opening_balance
#     closing_balance = statement.closing_balance
#     flagged = []

#     if opening_balance is None or closing_balance is None:
#         return flagged

#     prev_balance = opening_balance

#     for i, tx in enumerate(transactions):
#         # Determine the net change based on credit and debit
#         net_change = (tx.credit or 0.0) - (tx.debit or 0.0)
#         expected_balance = prev_balance + net_change

#         if not isclose(expected_balance, tx.balance, abs_tol=0.01):
#             flagged.append(FlaggedTransaction(
#                 index=i,
#                 issue=f"Expected balance after credit {tx.credit:.2f} and debit {tx.debit:.2f}: {expected_balance:.2f}, "
#                       f"found: {tx.balance:.2f}",
#                 transaction=tx,
#                 previous_balance=prev_balance,
#                 current_balance=tx.balance
#             ))

#         prev_balance = tx.balance

#     if not isclose(prev_balance, closing_balance, abs_tol=0.01):
#         flagged.append(FlaggedTransaction(
#             index=len(transactions),
#             issue=f"Expected closing balance: {closing_balance:.2f}, found: {prev_balance:.2f}"
#         ))

#     return flagged



# async def extract(file_path: str) -> BankStatement:
#     extractor = Extractor()
#     extractor.load_document_loader(DocumentLoaderPdfPlumber())
#     extractor.load_llm("gpt-4o-mini")
#     result = extractor.extract(file_path, BankStatement)

#     try:
#         result.period_start = parser.parse(result.period_start).date().isoformat()
#     except Exception as e:
#         logging.warning("Failed to parse period_start '%s': %s", result.period_start, e)

#     try:
#         result.period_end = parser.parse(result.period_end).date().isoformat()
#     except Exception as e:
#         logging.warning("Failed to parse period_end '%s': %s", result.period_end, e)

#     for txn in result.transactions:
#         try:
#             txn.date = parser.parse(txn.date).date().isoformat()
#         except Exception as e:
#             logging.warning("Failed to parse transaction date '%s': %s", txn.date, e)
        
#         logging.info("%s | %s | %0.2f | %0.2f | %0.2f", txn.date, txn.description, txn.credit, txn.debit, txn.balance)

#     return result


# async def parse_with_assistant(finalizedStatementRequest: FinalizedStatementRequest):
#     try:
#         thread = await openAIClient.beta.threads.create()
#         thread_id = thread.id
#         print("Thread created successfully")
#         await openAIClient.beta.threads.messages.create(
#             thread_id=thread_id,
#             role="user",
#             content=json.dumps(finalizedStatementRequest.dict())
#         )
#         print("Message added to thread successfully")
#         run = await openAIClient.beta.threads.runs.create(
#             thread_id=thread_id,
#             assistant_id=os.getenv("ASSISTANT_ID")
#         )
#         print("Run created successfully")
#         while True:
#             run_status = await openAIClient.beta.threads.runs.retrieve(
#                 thread_id=thread_id,
#                 run_id=run.id
#             )
#             if run_status.status == "completed":
#                 break
#             elif run_status.status in ["failed", "cancelled", "expired"]:
#                 raise HTTPException(status_code=500, detail=f"Run failed with status: {run_status.status}")
#             await asyncio.sleep(1)  # Wait a bit before polling again

#         messages = await openAIClient.beta.threads.messages.list(thread_id=thread_id)
#         for message in reversed(messages.data):  # newest last, so we reverse
#             if message.role == "assistant":
#                 reply = message.content[0].text.value  # Assuming text type content
#                 print("Assistant reply:", reply)
#                 return reply

#         raise HTTPException(status_code=500, detail="No assistant reply found.")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
