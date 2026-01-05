import { format, parseISO } from 'date-fns'
import './DataTable.css'

function DataTable({ data, onDelete }) {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>No entries yet. Add your first P&L entry to get started!</p>
      </div>
    )
  }

  const totalPnL = data.reduce((sum, entry) => sum + entry.pnl, 0)

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h2>All Entries</h2>
        <div className="table-summary">
          <span>Total Entries: {data.length}</span>
          <span className={`total-pnl ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
            Total P&L: ${totalPnL.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>P&L Amount</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(entry => (
              <tr
                key={entry.id}
                className={entry.pnl < 0 ? 'loss-row' : 'profit-row'}
              >
                <td>{format(parseISO(entry.date), 'MMM dd, yyyy')}</td>
                <td className={entry.pnl < 0 ? 'loss-amount' : 'profit-amount'}>
                  ${entry.pnl.toFixed(2)}
                </td>
                <td className="notes-cell">{entry.notes || '-'}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this entry?')) {
                        onDelete(entry.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable

