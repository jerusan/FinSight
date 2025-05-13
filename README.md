# FinSight

FinSight is an AI-powered financial insights platform that helps users analyze bank statements and assess financial health. It provides a modern dashboard for visualizing and understanding key financial metrics, making it especially useful for loan officers, financial advisors, and individuals seeking deeper insights into their finances.

## MVP
This project demonstrates a **loan approval support system**:

### 1. 🏦 Bank Statement Upload  
The underwriter uploads a bank statement in PDF format.

### 2. 🔍 Transaction Parsing & Verification  
The system parses the PDF and extracts transaction data.  
The underwriter must review the entries and fix any errors, such as:
- Mismatched balances  
- Formatting issues  
- Missing data
- The left side shows parsed transactions, right side shows the original PDF.

### 3. 📊 Financial Insights Dashboard  
Once verified, the system generates a detailed financial overview, including:
- Total income and monthly breakdown  
- Spending categories and patterns  
- Cash flow trends  
- Risk flags and loan affordability metrics

### 4. 🤖 Finance Assistant (Q&A Chat bot)  
Users can interact with a built-in assistant to ask follow-up questions like:
- “What are the recurring payments?”
- “How much was spent on groceries last month?”


This streamlines the underwriting process and helps assess financial health efficiently.
## Features
- **Bank Statement Upload**: Upload PDF bank statements for instant analysis.
- **Automated Data Extraction**: Parses transactions and account activity using AI and PDF extraction tools.
- **Financial Insights Dashboard**: Visualizes income, spending, cash flow stability, balance trends, loan affordability, and risk flags.
- **Interactive Table**: Review and edit extracted transactions before finalizing analysis.
- **AI Chat Assistant**: Ask questions about the financial data and receive contextual answers.

## Technology Stack
- **Frontend**: Next.js (React, TypeScript, Tailwind CSS, Recharts, Lucide Icons)
- **Backend**: FastAPI (Python 3.11), PDFPlumber, Pandas, OpenAI API
- **Containerization**: Docker, Docker Compose

## Directory Structure
```
FinSight/
├── backend/        # FastAPI backend for data extraction & analysis
├── frontend/       # Next.js frontend for dashboard & UI
├── docker-compose.yml
└── README.md       # (this file)
```

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 20+ (for manual frontend dev)
- Python 3.11+ (for manual backend dev)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd FinSight
```

### 2. Environment Variables
- Copy `.env.example` to `.env` in `backend/` and set your OpenAI API key and other configs.

### 3. Run with Docker Compose
```bash
docker-compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:3000 (see below for manual frontend)

### 4. Run Frontend (Development)
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 5. Run Backend (Development)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Usage
1. Upload a PDF bank statement.
2. Review and edit extracted transactions.
3. Finalize the statement to view the financial insights dashboard.
4. Interact with the AI assistant for deeper analysis.

## Deployment
- See `frontend/README.md` for Next.js deployment options (Vercel, Docker, etc).
- Backend can be deployed as a standard FastAPI app.

## License
MIT License. See `LICENSE` file for details.

---

*Empowering smarter financial decisions with AI.*
