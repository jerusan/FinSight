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
from models import *
from dateutil import parser

from extract_thinker import Extractor, DocumentLoaderPdfPlumber
from openai import AsyncOpenAI

# --- Config & Setup ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
QA_ENGINE_ASSISTANT_ID = os.getenv("Q_AND_A_ASSISTANT_ID_2")
DASHBOARD_ASSISTANT_ID = os.getenv("DASHBOARD_ASSISTANT_ID")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

openAIClient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX: This is a hack for MVP, should implement thread management to support multiple users and statements
qa_engine_assistant_thread_id = None

# -- API Routes --
@app.get("/", response_model=dict)
async def root() -> dict:
    return {"message": "Bank Statement Analysis API"}

@app.post("/finalize-statement/", response_model=AnalysisResult)
async def finalize_statement(data: FinalizedStatementRequest) -> AnalysisResult:
    global qa_engine_assistant_thread_id
    print("Finalized statement:", data)

    res = await generate_dashboard_with_assistant(data)
    print("Financial data", res)
    result = AnalysisResult(**json.loads(res))
    await start_conversation_with_statement(result)
    return result

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

@app.post("/ask-question-in-thread/", response_model=ChatResponse)
async def ask_question_in_thread(chat_request: ChatRequest) -> ChatResponse:
    if qa_engine_assistant_thread_id is None:
        raise HTTPException(status_code=400, detail="No thread ID provided")

    res = await ask_question_in_thread(qa_engine_assistant_thread_id, chat_request.question)
    print("Chat response:", res)
    return ChatResponse(answer=res)

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


# -- Assistant Functions --

# Bank QA Assistant starter conversation
async def start_conversation_with_statement(data: AnalysisResult) -> str:
    global qa_engine_assistant_thread_id
    thread = await openAIClient.beta.threads.create()
    
    # Add bank statement to the thread
    await openAIClient.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=[
        {
            "type": "text",
            "text": json.dumps({ "user_bank_statement": data.model_dump() })
        }
    ])

    # Start the assistant run
    run = await openAIClient.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=QA_ENGINE_ASSISTANT_ID
    )

    # Poll for completion
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
            print("QA Assistant starter reply:", message.content[0].text.value)
            message.content[0].text.value

    print("QA Thread ID:", thread.id)
    qa_engine_assistant_thread_id = thread.id
    return thread.id


# Bank QA Assistant chat
async def ask_question_in_thread(thread_id: str, question: str) -> str:
    await openAIClient.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=[
            {
                "type": "text",
                "text": question
            }
        ]
    )

    run = await openAIClient.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=QA_ENGINE_ASSISTANT_ID
    )

    while True:
        status = await openAIClient.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        if status.status == "completed":
            break
        elif status.status in {"failed", "cancelled", "expired"}:
            raise HTTPException(status_code=500, detail=f"Run failed: {status.status}")
        await asyncio.sleep(1)

    messages = await openAIClient.beta.threads.messages.list(thread_id=thread_id)
    for message in reversed(messages.data):
        if message.role == "assistant":
            print("Assistant reply:", message.content[0].text.value)
            return message.content[0].text.value

    raise HTTPException(status_code=500, detail="No assistant reply found.")


# Dashboard Assistant  
async def generate_dashboard_with_assistant(data: FinalizedStatementRequest) -> str:
    thread = await openAIClient.beta.threads.create()
    await openAIClient.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=json.dumps(data.dict())
    )
    run = await openAIClient.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=DASHBOARD_ASSISTANT_ID
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
