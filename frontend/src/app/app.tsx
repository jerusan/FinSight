'use client'
import React, { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { StatementTable } from './components/StatementTable'
import { PDFViewer } from './components/PDFViewer'
import { AlertTriangleIcon, CheckIcon } from 'lucide-react'
import Dashboard from './components/FinancialInsightDashboard/Dashboard'
export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<any[] | null>(null)
  const [currency, setCurrency] = useState('')
  const [statementInfo, setStatementInfo] = useState<any | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [financialData, setFinancialData] = useState<any | null>(null)
  const [processingInsights, setProcessingInsights] = useState(false)
  const onDataUpdate = (newData: any[]) => {
    console.log("onDataUpdate", newData)
  }

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsProcessing(true)
    setProcessedData(null)
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const response = await fetch('http://localhost:8000/upload-statement/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        alert('Upload failed: ' + (error.detail || response.statusText));
        setIsProcessing(false);
        return;
      }
      const data = await response.json();

      if (data.summary && data.summary.transactions) {

        const flaggedIndexes = new Set((data.flagged || []).map((f: any) => f.index));

        const transactions = data.summary.transactions.map((item: any, idx: number) => ({
          ...item,
          id: idx,
          needsReview: flaggedIndexes.has(idx),
          issue: flaggedIndexes.has(idx)
            ? (data.flagged.find((f: any) => f.index === idx)?.issue || '')
            : '',
        }));
        setProcessedData(transactions);
        setCurrency(data.summary.currency);
        setStatementInfo(data.summary);
      } else {
        setProcessedData([]);
      }
    } catch (err: any) {
      alert('An error occurred: ' + (err.message || err));
    } finally {
      setIsProcessing(false);
    }
  }
  const handleCellEdit = (id: number, field: string, value: any) => {
    if (!processedData) return

    const existing = processedData.find(item => item.id === id)

    if (existing) {
      // Update existing row
      setProcessedData(
        processedData.map((item) =>
          item.id === id
            ? {
              ...item,
              [field]: value,
              needsReview: false,
            }
            : item,
        )
      )
    } else {
      // Create new row and insert it
      const newRow = {
        id,
        date: '',
        description: '',
        credit: 0,
        debit: 0,
        balance: 0,
        needsReview: false,
        issue: '',
        [field]: value,
      }

      setProcessedData([...processedData, newRow])
    }
  }

  const handleFinalize = async () => {
    const transformedData = processedData?.map(item => ({
      date: item.date,
      description: item.description,
      credit: item.credit,
      debit: item.debit,
      balance: item.balance
    }));
    setProcessingInsights(true)
    const res = {
      summary: statementInfo,
      finalizedTransactions: transformedData
    }
    const response = await fetch('http://localhost:8000/finalize-statement/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(res),
    });
    const financialData = await response.json()
    setFinancialData(financialData)
    setProcessingInsights(false)
    setShowDashboard(true)
    setFile(null)
    setProcessedData(null)

  }
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {showDashboard || processingInsights ? (
        showDashboard ? <Dashboard financialData={financialData} currency={currency} /> :
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Generating financial insights...
              </p>
            </div>
          </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <img src="/paper-pen-icon.svg" alt="Paper Pen Icon" className="w-12 h-12" />
                  <h1 className="text-2xl font-bold text-blue-600">FinSight</h1>
                </div>
                {processedData && (
                  <button
                    onClick={handleFinalize}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
                  >
                    Finalize Statement
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!file ? (
              <div className="flex flex-col items-center justify-center h-[80vh]">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            ) : (
              <div className="flex flex-col h-[80vh]">
                {/* Review Header */}
                <div className="mb-4 flex items-center">
                  <h2 className="text-xl font-semibold text-black">Statement Review</h2>
                  {processedData &&
                    (processedData.some((item) => item.needsReview) ? (
                      <div className="ml-4 flex items-center text-orange-500">
                        <AlertTriangleIcon className="w-5 h-5 mr-1" />
                        <span>Some transactions require your attention</span>
                      </div>
                    ) : (
                      <div className="ml-4 flex items-center text-green-500">
                        <CheckIcon className="w-5 h-5 mr-1" />
                        <span>No transactions require your attention</span>
                      </div>
                    ))}
                </div>

                {/* Processing State */}
                {isProcessing ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">
                        Processing your statement...
                      </p>
                    </div>
                  </div>
                ) : (
                  processedData && (
                    <div className="flex gap-4 h-full">
                      {/* Table Section */}
                      <div className="w-full overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                        <StatementTable
                          data={processedData}
                          currency={currency}
                          onCellEdit={handleCellEdit}
                          onDataUpdate={onDataUpdate}
                        />
                      </div>
                      {/* PDF Viewer Section */}
                      <div className="w-full border border-gray-200 rounded-lg bg-white shadow-sm">
                        <PDFViewer file={file} />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
