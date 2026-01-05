import { useState, useEffect } from 'react'
import PLEntryForm from './components/PLEntryForm'
import Dashboard from './components/Dashboard'
import DataTable from './components/DataTable'
import CalendarView from './components/CalendarView'
import CapitalManagement from './components/CapitalManagement'
import './App.css'

function App() {
  const [tradeData, setTradeData] = useState([])
  const [capitalData, setCapitalData] = useState({
    initialCapital: 0,
    transactions: [] // deposits and withdrawals
  })
  const [activeTab, setActiveTab] = useState('entry')

  useEffect(() => {
    // Load trade data from localStorage
    const savedData = localStorage.getItem('tradeData')
    if (savedData) {
      try {
        setTradeData(JSON.parse(savedData))
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }

    // Load capital data from localStorage
    const savedCapital = localStorage.getItem('capitalData')
    if (savedCapital) {
      try {
        setCapitalData(JSON.parse(savedCapital))
      } catch (e) {
        console.error('Error loading capital data:', e)
      }
    }
  }, [])

  const saveData = (newData) => {
    setTradeData(newData)
    localStorage.setItem('tradeData', JSON.stringify(newData))
  }

  const saveCapitalData = (newCapitalData) => {
    setCapitalData(newCapitalData)
    localStorage.setItem('capitalData', JSON.stringify(newCapitalData))
  }

  const addPLEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: entry.date,
      pnl: parseFloat(entry.pnl),
      notes: entry.notes || ''
    }
    const updatedData = [...tradeData, newEntry].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    saveData(updatedData)
  }

  const deleteEntry = (id) => {
    const updatedData = tradeData.filter(entry => entry.id !== id)
    saveData(updatedData)
  }

  const updateCapital = (updates) => {
    const updatedCapital = { ...capitalData, ...updates }
    saveCapitalData(updatedCapital)
  }

  const addCapitalTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      date: transaction.date,
      type: transaction.type, // 'deposit' or 'withdrawal'
      amount: parseFloat(transaction.amount),
      notes: transaction.notes || ''
    }
    const updatedTransactions = [...capitalData.transactions, newTransaction]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    updateCapital({ transactions: updatedTransactions })
  }

  const deleteCapitalTransaction = (id) => {
    const updatedTransactions = capitalData.transactions.filter(t => t.id !== id)
    updateCapital({ transactions: updatedTransactions })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trade Tracker</h1>
        <p>Track your daily P&L with advanced analytics</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          Add Entry
        </button>
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`nav-tab ${activeTab === 'capital' ? 'active' : ''}`}
          onClick={() => setActiveTab('capital')}
        >
          Capital
        </button>
        <button
          className={`nav-tab ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          Data Table
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'entry' && (
          <PLEntryForm onAdd={addPLEntry} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            data={tradeData} 
            capitalData={capitalData}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView data={tradeData} />
        )}
        {activeTab === 'capital' && (
          <CapitalManagement
            capitalData={capitalData}
            onUpdateCapital={updateCapital}
            onAddTransaction={addCapitalTransaction}
            onDeleteTransaction={deleteCapitalTransaction}
          />
        )}
        {activeTab === 'table' && (
          <DataTable data={tradeData} onDelete={deleteEntry} />
        )}
      </main>
    </div>
  )
}

export default App

