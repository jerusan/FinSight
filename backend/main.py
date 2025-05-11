from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Union

import shutil
import os
import asyncio
import logging
import json
from dotenv import load_dotenv
from math import isclose
from dateutil import parser
from extract_thinker import Extractor, DocumentLoaderPdfPlumber
from openai import AsyncOpenAI
from models import *

# --- Config & Setup ---
load_dotenv()
logging.basicConfig(level=logging.INFO)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

openAIClient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- API Routes --
@app.get("/", response_model=dict)
async def root() -> dict:
    return {"message": "Bank Statement Analysis API"}

@app.post("/finalize-statement/", response_model=AnalysisResult)
async def finalize_statement(data: FinalizedStatementRequest) -> AnalysisResult:
    print("Finalized statement:", data)

    res = await parse_with_assistant(data)
    print("Financial data", res)

    return AnalysisResult(**json.loads(res))

@app.post("/upload-statement/", response_model=AnalysisResponse)
async def upload_bank_statement(file: UploadFile = File(...)) -> Union[AnalysisResponse, JSONResponse]:
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logging.info("File saved successfully: %s", file.filename)

        statement_summary = await extract(file_location)
        statement_summary.filename = file.filename

        flagged = flag_inconsistencies(statement_summary)
        print("Flagged transactions:", flagged)
        return AnalysisResponse(
            summary=statement_summary,
            flagged=flagged
        )
    except Exception as e:
        logging.error("Error processing file: %s", e)
        raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")


# --- Core Logic Functions ---

def flag_inconsistencies(statement: "BankStatement") -> List["FlaggedTransaction"]:
    flagged = []
    if statement.opening_balance is None or statement.closing_balance is None:
        return flagged

    prev_balance = statement.opening_balance

    for i, tx in enumerate(statement.transactions):
        net_change = (tx.credit or 0) - (tx.debit or 0)
        expected = prev_balance + net_change

        if not isclose(expected, tx.balance, abs_tol=0.01):
            flagged.append(FlaggedTransaction(
                index=i,
                issue=f"Expected balance: {expected:.2f}, Found: {tx.balance:.2f}",
                transaction=tx,
                previous_balance=prev_balance,
                current_balance=tx.balance
            ))
        prev_balance = tx.balance

    if not isclose(prev_balance, statement.closing_balance, abs_tol=0.01):
        flagged.append(FlaggedTransaction(
            index=len(statement.transactions),
            issue=f"Final balance mismatch. Expected: {statement.closing_balance:.2f}, Found: {prev_balance:.2f}"
        ))

    return flagged

async def extract(file_path: str) -> "BankStatement":
    extractor = Extractor()
    extractor.load_document_loader(DocumentLoaderPdfPlumber())
    extractor.load_llm("gpt-4o-mini")
    result = extractor.extract(file_path, BankStatement)

    for attr in ["period_start", "period_end"]:
        try:
            setattr(result, attr, parser.parse(getattr(result, attr)).date().isoformat())
        except Exception as e:
            logging.warning("Failed to parse %s: %s", attr, e)

    for txn in result.transactions:
        try:
            txn.date = parser.parse(txn.date).date().isoformat()
        except Exception as e:
            logging.warning("Bad txn date '%s': %s", txn.date, e)
        logging.info("%s | %s | %0.2f | %0.2f | %0.2f", txn.date, txn.description, txn.credit, txn.debit, txn.balance)

    return result

async def parse_with_assistant(data: FinalizedStatementRequest) -> str:
    thread = await openAIClient.beta.threads.create()
    await openAIClient.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=json.dumps(data.dict())
    )
    run = await openAIClient.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=ASSISTANT_ID
    )

    while True:
        status = await openAIClient.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        if status.status == "completed":
            break
        elif status.status in {"failed", "cancelled", "expired"}:
            raise HTTPException(status_code=500, detail=f"Run failed: {status.status}")
        await asyncio.sleep(1)

    messages = await openAIClient.beta.threads.messages.list(thread_id=thread.id)
    for message in reversed(messages.data):
        if message.role == "assistant":
            return message.content[0].text.value

    raise HTTPException(status_code=500, detail="No assistant reply found.")
