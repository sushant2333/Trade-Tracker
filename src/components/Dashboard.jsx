import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { format, parseISO } from 'date-fns'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard({ data, capitalData }) {
  const [pnlViewMode, setPnlViewMode] = useState('monthly') // 'daily' or 'monthly'

  const monthlyData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], values: [], cumulative: [] }

    // Group by month
    const monthlyMap = new Map()
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

    sortedData.forEach(entry => {
      const monthKey = format(parseISO(entry.date), 'yyyy-MM')
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { total: 0, count: 0 })
      }
      const monthData = monthlyMap.get(monthKey)
      monthData.total += entry.pnl
      monthData.count += 1
    })

    const sortedKeys = Array.from(monthlyMap.keys()).sort()
    
    const labels = sortedKeys.map(key => format(parseISO(`${key}-01`), 'MMM yyyy'))
    
    const values = sortedKeys.map(key => monthlyMap.get(key)?.total || 0)

    // Calculate cumulative P&L
    const cumulative = []
    let runningTotal = 0
    values.forEach(val => {
      runningTotal += val
      cumulative.push(runningTotal)
    })

    return { labels, values, cumulative }
  }, [data])

  const dailyDataFull = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], values: [] }

    const sortedData = [...data]
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Group by date (sum multiple entries on same day)
    const dailyMap = new Map()
    sortedData.forEach(entry => {
      const dateKey = entry.date
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, 0)
      }
      dailyMap.set(dateKey, dailyMap.get(dateKey) + entry.pnl)
    })

    const sortedDates = Array.from(dailyMap.keys()).sort()
    const labels = sortedDates.map(date => format(parseISO(date), 'MMM dd, yyyy'))
    const values = sortedDates.map(date => dailyMap.get(date))

    return { labels, values }
  }, [data])

  const dailyData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], values: [] }

    const sortedData = [...data]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30) // Last 30 days

    // Group by date
    const dailyMap = new Map()
    sortedData.forEach(entry => {
      const dateKey = entry.date
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, 0)
      }
      dailyMap.set(dateKey, dailyMap.get(dateKey) + entry.pnl)
    })

    const sortedDates = Array.from(dailyMap.keys()).sort()
    const labels = sortedDates.map(date => format(parseISO(date), 'MMM dd'))
    const values = sortedDates.map(date => dailyMap.get(date))

    return { labels, values }
  }, [data])

  // Calculate equity curve
  const equityCurve = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], values: [] }
    if (!capitalData || !capitalData.initialCapital) return { labels: [], values: [] }

    // Get all dates (trade dates + transaction dates)
    const allDates = new Set()
    data.forEach(entry => allDates.add(entry.date))
    capitalData.transactions?.forEach(trans => allDates.add(trans.date))
    
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))
    
    // Create map of dates to P&L
    const pnlByDate = new Map()
    data.forEach(entry => {
      const dateKey = entry.date
      pnlByDate.set(dateKey, (pnlByDate.get(dateKey) || 0) + entry.pnl)
    })

    // Create map of dates to capital transactions
    const transactionsByDate = new Map()
    capitalData.transactions?.forEach(trans => {
      const dateKey = trans.date
      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, [])
      }
      transactionsByDate.get(dateKey).push(trans)
    })

    // Calculate equity over time
    let currentEquity = capitalData.initialCapital
    const equityValues = []
    const labels = []

    sortedDates.forEach(date => {
      // Apply capital transactions first (deposits/withdrawals)
      const transactions = transactionsByDate.get(date) || []
      transactions.forEach(trans => {
        if (trans.type === 'deposit') {
          currentEquity += trans.amount
        } else {
          currentEquity -= trans.amount
        }
      })

      // Then apply P&L
      const pnl = pnlByDate.get(date) || 0
      currentEquity += pnl

      labels.push(format(parseISO(date), 'MMM dd, yyyy'))
      equityValues.push(currentEquity)
    })

    return { labels, values: equityValues }
  }, [data, capitalData])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e0d4ff',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(45, 27, 78, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e0d4ff',
        borderColor: '#6b3fa0',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#e0d4ff'
        },
        grid: {
          color: 'rgba(107, 63, 160, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#e0d4ff'
        },
        grid: {
          color: 'rgba(107, 63, 160, 0.2)'
        }
      }
    }
  }

  const monthlyBarData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Monthly P&L',
        data: monthlyData.values,
        backgroundColor: monthlyData.values.map(val => 
          val < 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'
        ),
        borderColor: monthlyData.values.map(val => 
          val < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
        ),
        borderWidth: 2
      }
    ]
  }

  const dailyBarData = {
    labels: dailyDataFull.labels,
    datasets: [
      {
        label: 'Daily P&L',
        data: dailyDataFull.values,
        backgroundColor: dailyDataFull.values.map(val => 
          val < 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'
        ),
        borderColor: dailyDataFull.values.map(val => 
          val < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
        ),
        borderWidth: 2
      }
    ]
  }

  const trendlineData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Cumulative P&L',
        data: monthlyData.cumulative,
        borderColor: '#8b5fbf',
        backgroundColor: 'rgba(139, 95, 191, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#8b5fbf',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const dailyLineData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: 'Daily P&L (Last 30 Days)',
        data: dailyData.values,
        borderColor: '#6b3fa0',
        backgroundColor: dailyData.values.map(val => 
          val < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
        ),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: dailyData.values.map(val => 
          val < 0 ? '#ef4444' : '#22c55e'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const equityCurveData = {
    labels: equityCurve.labels,
    datasets: [
      {
        label: 'Equity',
        data: equityCurve.values,
        borderColor: '#8b5fbf',
        backgroundColor: 'rgba(139, 95, 191, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8b5fbf',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const totalPnL = data.reduce((sum, entry) => sum + entry.pnl, 0)
  const winCount = data.filter(entry => entry.pnl > 0).length
  const lossCount = data.filter(entry => entry.pnl < 0).length
  const winRate = data.length > 0 ? ((winCount / data.length) * 100).toFixed(1) : 0

  // Calculate current equity
  let currentEquity = capitalData?.initialCapital || 0
  capitalData?.transactions?.forEach(trans => {
    if (trans.type === 'deposit') {
      currentEquity += trans.amount
    } else {
      currentEquity -= trans.amount
    }
  })
  currentEquity += totalPnL

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total P&L</h3>
          <p className={totalPnL >= 0 ? 'stat-profit' : 'stat-loss'}>
            ${totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Current Equity</h3>
          <p className="stat-equity">
            ${currentEquity.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Trades</h3>
          <p className="stat-neutral">{data.length}</p>
        </div>
        <div className="stat-card">
          <h3>Win Rate</h3>
          <p className="stat-neutral">{winRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Wins / Losses</h3>
          <p className="stat-neutral">{winCount} / {lossCount}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>{pnlViewMode === 'monthly' ? 'Monthly' : 'Daily'} P&L Analysis</h3>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${pnlViewMode === 'monthly' ? 'active' : ''}`}
                onClick={() => setPnlViewMode('monthly')}
              >
                Monthly
              </button>
              <button
                className={`toggle-btn ${pnlViewMode === 'daily' ? 'active' : ''}`}
                onClick={() => setPnlViewMode('daily')}
              >
                Daily
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar data={pnlViewMode === 'monthly' ? monthlyBarData : dailyBarData} options={chartOptions} />
          </div>
        </div>

        {equityCurve.labels.length > 0 && (
          <div className="chart-card full-width">
            <h3>Equity Curve</h3>
            <div className="chart-wrapper">
              <Line data={equityCurveData} options={chartOptions} />
            </div>
          </div>
        )}

        <div className="chart-card">
          <h3>Cumulative P&L Trendline</h3>
          <div className="chart-wrapper">
            <Line data={trendlineData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Last 30 Days Daily P&L</h3>
          <div className="chart-wrapper">
            <Line data={dailyLineData} options={chartOptions} />
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="empty-state">
          <p>No data available. Add some entries to see your charts!</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
