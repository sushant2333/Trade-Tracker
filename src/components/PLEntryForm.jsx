import { useState } from 'react'
import './PLEntryForm.css'

function PLEntryForm({ onAdd }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pnl, setPnl] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!date || !pnl) {
      alert('Please fill in date and P&L amount')
      return
    }

    onAdd({ date, pnl, notes })
    
    // Reset form
    setPnl('')
    setNotes('')
    setDate(new Date().toISOString().split('T')[0])
    
    alert('Entry added successfully!')
  }

  return (
    <div className="pl-entry-form-container">
      <div className="form-card">
        <h2>Add Daily P&L Entry</h2>
        <form onSubmit={handleSubmit} className="pl-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pnl">P&L Amount</label>
            <input
              type="number"
              id="pnl"
              step="0.01"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              className="form-input"
              placeholder="Enter profit (positive) or loss (negative)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              placeholder="Add any notes about this trade..."
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn">
            Add Entry
          </button>
        </form>
      </div>
    </div>
  )
}

export default PLEntryForm

