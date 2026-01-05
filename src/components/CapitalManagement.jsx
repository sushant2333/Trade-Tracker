import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import './CapitalManagement.css'

function CapitalManagement({ capitalData, onUpdateCapital, onAddTransaction, onDeleteTransaction }) {
  const [initialCapital, setInitialCapital] = useState(capitalData.initialCapital || '')

  useEffect(() => {
    setInitialCapital(capitalData.initialCapital || '')
  }, [capitalData.initialCapital])
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionType, setTransactionType] = useState('deposit')
  const [transactionNotes, setTransactionNotes] = useState('')

  const handleSaveInitialCapital = () => {
    const capital = parseFloat(initialCapital) || 0
    onUpdateCapital({ initialCapital: capital })
    alert('Initial capital updated!')
  }

  const handleAddTransaction = (e) => {
    e.preventDefault()
    if (!transactionDate || !transactionAmount) {
      alert('Please fill in date and amount')
      return
    }

    onAddTransaction({
      date: transactionDate,
      type: transactionType,
      amount: transactionAmount,
      notes: transactionNotes
    })

    setTransactionAmount('')
    setTransactionNotes('')
    setTransactionDate(new Date().toISOString().split('T')[0])
    setTransactionType('deposit')
    
    alert('Transaction added successfully!')
  }

  const calculateCurrentCapital = () => {
    let total = capitalData.initialCapital || 0
    capitalData.transactions?.forEach(transaction => {
      if (transaction.type === 'deposit') {
        total += transaction.amount
      } else {
        total -= transaction.amount
      }
    })
    return total
  }

  const currentCapital = calculateCurrentCapital()

  return (
    <div className="capital-management-container">
      <div className="capital-overview">
        <div className="overview-card">
          <h3>Initial Capital</h3>
          <div className="capital-input-group">
            <input
              type="number"
              step="0.01"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="capital-input"
              placeholder="Enter initial capital"
            />
            <button onClick={handleSaveInitialCapital} className="save-btn">
              Save
            </button>
          </div>
        </div>

        <div className="overview-card">
          <h3>Current Capital</h3>
          <p className="current-capital">${currentCapital.toFixed(2)}</p>
        </div>
      </div>

      <div className="transaction-section">
        <div className="transaction-form-card">
          <h2>Add Deposit / Withdrawal</h2>
          <form onSubmit={handleAddTransaction} className="transaction-form">
            <div className="form-group">
              <label htmlFor="trans-date">Date</label>
              <input
                type="date"
                id="trans-date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="trans-type">Type</label>
              <select
                id="trans-type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="form-input"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="trans-amount">Amount</label>
              <input
                type="number"
                id="trans-amount"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="form-input"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="trans-notes">Notes (Optional)</label>
              <textarea
                id="trans-notes"
                value={transactionNotes}
                onChange={(e) => setTransactionNotes(e.target.value)}
                className="form-textarea"
                placeholder="Add any notes..."
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn">
              Add Transaction
            </button>
          </form>
        </div>

        <div className="transaction-list-card">
          <h2>Transaction History</h2>
          {capitalData.transactions && capitalData.transactions.length > 0 ? (
            <div className="transaction-list">
              {capitalData.transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`transaction-item ${transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}`}
                >
                  <div className="transaction-info">
                    <div className="transaction-header">
                      <span className="transaction-type">
                        {transaction.type === 'deposit' ? '📥 Deposit' : '📤 Withdrawal'}
                      </span>
                      <span className="transaction-date">
                        {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="transaction-amount">
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                    {transaction.notes && (
                      <div className="transaction-notes">{transaction.notes}</div>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        onDeleteTransaction(transaction.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions yet. Add your first deposit or withdrawal to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CapitalManagement

