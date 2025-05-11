import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`


interface PDFViewerProps {
  file: File | null
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    const loadPdf = async () => {
      if (!fileUrl) return
      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const doc = await loadingTask.promise
      setPdfDoc(doc)
    }
    loadPdf()
  }, [fileUrl])

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return
    const page = await pdfDoc.getPage(num)
    const viewport = page.getViewport({ scale })
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport }).promise
  }

  useEffect(() => {
    renderPage(pageNumber)
  }, [pageNumber, scale, pdfDoc])

  const changePage = (offset: number) => {
    if (!pdfDoc) return
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), pdfDoc.numPages))
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6))

  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No PDF file loaded
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-gray-50">
        <canvas ref={canvasRef} className="shadow rounded border" />
      </div>
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex space-x-2">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5 text-black" />
          </button>
          <span className="text-sm text-black">
            Page {pageNumber} of {pdfDoc?.numPages || '--'}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pdfDoc !== null && pageNumber >= pdfDoc.numPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRightIcon className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="flex space-x-2">
          <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-100">
            <ZoomOutIcon className="w-5 h-5 text-black" />
          </button>
          <span className="text-sm text-black">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-100">
            <ZoomInIcon className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
