import { useState, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns'
import './CalendarView.css'

function CalendarView({ data }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Group P&L by date
  const pnlByDate = useMemo(() => {
    const map = new Map()
    data.forEach(entry => {
      const dateKey = entry.date
      if (!map.has(dateKey)) {
        map.set(dateKey, 0)
      }
      map.set(dateKey, map.get(dateKey) + entry.pnl)
    })
    return map
  }, [data])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of month to determine offset
  const firstDayOfWeek = getDay(monthStart)
  const offsetDays = Array(firstDayOfWeek).fill(null)

  const getDayPnL = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return pnlByDate.get(dateStr) || null
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const monthTotal = daysInMonth.reduce((sum, day) => {
    const pnl = getDayPnL(day)
    return sum + (pnl || 0)
  }, 0)

  return (
    <div className="calendar-view-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={goToPreviousMonth} className="nav-btn">
            ← Prev
          </button>
          <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={goToNextMonth} className="nav-btn">
            Next →
          </button>
        </div>
        <button onClick={goToToday} className="today-btn">
          Today
        </button>
        <div className="month-summary">
          <span>Month Total: </span>
          <span className={monthTotal >= 0 ? 'month-profit' : 'month-loss'}>
            ${monthTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-grid">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {/* Offset days for alignment */}
          {offsetDays.map((_, index) => (
            <div key={`offset-${index}`} className="calendar-day empty"></div>
          ))}

          {/* Days of the month */}
          {daysInMonth.map(day => {
            const pnl = getDayPnL(day)
            const isToday = isSameDay(day, new Date())
            const hasData = pnl !== null

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={`calendar-day ${hasData ? (pnl >= 0 ? 'profit-day' : 'loss-day') : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{format(day, 'd')}</div>
                {hasData && (
                  <div className={`day-pnl ${pnl >= 0 ? 'profit' : 'loss'}`}>
                    ${pnl.toFixed(2)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color profit-legend"></div>
          <span>Profit Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-color loss-legend"></div>
          <span>Loss Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today-legend"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarView

