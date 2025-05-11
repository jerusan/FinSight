import React, { useState, useRef } from 'react'
import { FileIcon, UploadIcon } from 'lucide-react'
interface FileUploadProps {
  onFileUpload: (file: File) => void
}
export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        onFileUpload(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        onFileUpload(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  return (
    <div
      className={`w-full max-w-lg p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <div className="flex flex-col items-center">
        <div className="mb-4 p-4 bg-blue-100 rounded-full">
          {isDragging ? (
            <UploadIcon className="w-8 h-8 text-blue-600" />
          ) : (
            <FileIcon className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Upload Bank Statement
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Drag and drop your PDF file here, or click to select a file
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Select PDF File
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
