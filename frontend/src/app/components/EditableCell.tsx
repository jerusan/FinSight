import React, { useEffect, useState, useRef } from 'react'
interface EditableCellProps {
  value: string
  onSave: (value: string) => void
  type?: 'text' | 'number'
}
export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
}) => {
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue)
    } else if (e.key === 'Escape') {
      onSave(value)
    }
  }
  const handleBlur = () => {
    onSave(editValue)
  }
  return (
    <input
      ref={inputRef}
      type={type}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-full p-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
