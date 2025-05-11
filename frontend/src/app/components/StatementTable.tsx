import React, { useState } from 'react'
import { EditableCell } from './EditableCell'
import { formatCurrency } from '../utils/formatters'
interface Transaction {
  id: number
  date: string
  description: string
  credit: number
  debit: number
  balance: number
  needsReview: boolean
  issue?: string
}
interface StatementTableProps {
  data: Transaction[]
  currency: string
  onCellEdit: (id: number, field: string, value: any) => void
  onDataUpdate: (newData: Transaction[]) => void
}
export const StatementTable: React.FC<StatementTableProps> = ({
  data,
  currency,
  onCellEdit,
  onDataUpdate,
}) => {
  const [tableData, setTableData] = useState(data)

  const handleInsertRow = (index: number) => {
    const newId = Math.max(0, ...tableData.map(t => t.id)) + 1
    const newRow: Transaction = {
      id: newId,
      date: '',
      description: '',
      credit: 0,
      debit: 0,
      balance: 0,
      needsReview: false,
      issue: '',
    }

    const newData = [...tableData.slice(0, index), newRow, ...tableData.slice(index)]
    setTableData(newData)
    setEditingCell({ id: newId, field: 'date' })
    onDataUpdate(newData)
  }

  const [editingCell, setEditingCell] = useState<{
    id: number
    field: string
  } | null>(null)

  const handleCellClick = (id: number, field: string) => {
    if (['description', 'balance', 'amount', 'date'].includes(field)) {
      setEditingCell({
        id,
        field,
      })
    }
  }

  const handleCellSave = (id: number, field: string, value: any) => {
    onCellEdit(id, field, value)
    setEditingCell(null)
    const newData = tableData.map(t =>
      t.id === id ? { ...t, [field]: value }: t
    )
    setTableData(newData)
    onDataUpdate(newData)
  }

  return (
    <div className="overflow-y-auto max-h-[80vh]">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Credit
            </th>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Debit
            </th>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Balance
            </th>
            <th
              scope="col"
              className="sticky top-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Issue
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              {index >= 0 && (
                <tr
                  className="relative group h-4"
                  onClick={() => handleInsertRow(index)}
                >
                  <td colSpan={5} className="relative p-0">
                    <button
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow"
                      title="Add row"
                    >
                      +
                    </button>
                  </td>
                </tr>
              )}
              <tr
                key={transaction.id}
                className={transaction.needsReview ? 'bg-orange-50' : ''}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={() => handleCellClick(transaction.id, 'date')}
                >
                  {editingCell?.id === transaction.id &&
                    editingCell?.field === 'date' ? (
                    <EditableCell
                      value={transaction.date}
                      onSave={(value) =>
                        handleCellSave(transaction.id, 'date', value)
                      }
                    />
                  ) : (
                    <div
                      className={transaction.needsReview ? 'text-orange-700' : ''}
                    >
                      {transaction.date}
                    </div>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={() => handleCellClick(transaction.id, 'description')}
                >
                  {editingCell?.id === transaction.id &&
                    editingCell?.field === 'description' ? (
                    <EditableCell
                      value={transaction.description}
                      onSave={(value) =>
                        handleCellSave(transaction.id, 'description', value)
                      }
                    />
                  ) : (
                    <div
                      className={transaction.needsReview ? 'text-orange-700' : ''}
                    >
                      {transaction.description}
                    </div>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={() => handleCellClick(transaction.id, 'credit')}
                >
                  {editingCell?.id === transaction.id &&
                    editingCell?.field === 'credit' ? (
                    <EditableCell
                      value={transaction.credit.toString()}
                      onSave={(value) =>
                        handleCellSave(
                          transaction.id,
                          'credit',
                          parseFloat(value),
                        )
                      }
                      type="number"
                    />
                  ) : (
                    <div
                      className={`${transaction.credit < 0 ? 'text-red-600' : 'text-green-600'} ${transaction.needsReview ? 'font-medium' : ''}`}
                    >
                      {formatCurrency(transaction.credit, currency)}
                    </div>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={() => handleCellClick(transaction.id, 'debit')}
                >
                  {editingCell?.id === transaction.id &&
                    editingCell?.field === 'debit' ? (
                    <EditableCell
                      value={transaction.debit.toString()}
                      onSave={(value) =>
                        handleCellSave(
                          transaction.id,
                          'debit',
                          parseFloat(value),
                        )
                      }
                      type="number"
                    />
                  ) : (
                    <div
                      className={`${transaction.debit < 0 ? 'text-red-600' : 'text-green-600'} ${transaction.needsReview ? 'font-medium' : ''}`}
                    >
                      {formatCurrency(transaction.debit, currency)}
                    </div>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={() => handleCellClick(transaction.id, 'balance')}
                >
                  {editingCell?.id === transaction.id &&
                    editingCell?.field === 'balance' ? (
                    <EditableCell
                      value={transaction.balance.toString()}
                      onSave={(value) =>
                        handleCellSave(transaction.id, 'balance', parseFloat(value))
                      }
                      type="number"
                    />
                  ) : (
                    <div
                      className={`${transaction.balance < 0 ? 'text-red-600' : 'text-green-600'} ${transaction.needsReview ? 'font-medium' : ''}`}
                    >
                      {formatCurrency(transaction.balance, currency)}
                    </div>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {transaction.issue}
                </td>
              </tr>
            </React.Fragment>
          ))}


          <tr className="relative group h-4" onClick={() => handleInsertRow(tableData.length)}>
            <td colSpan={5} className="relative p-0">
              <button
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow"
                title="Add row"
              >
                +
              </button>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  )
}
