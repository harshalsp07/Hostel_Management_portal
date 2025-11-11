import React, { useState, useEffect } from 'react';
import calendarIcon from '../assets/icons/calendar.svg';
import './styles-additions.css';

export default function DateCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const today = new Date();
      const isToday = 
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }
    
    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isCurrentMonth = 
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedToday = today.toLocaleDateString('en-US', dateOptions);

  return (
    <div className="date-widget">
      <h3>
        <img src={calendarIcon} alt="" style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 6 }} />
        Today's Date
      </h3>
      <div className="date-display">
        {today.getDate()}
      </div>
      <div className="date-display-full">
        {formattedToday}
      </div>

      <div className="calendar-header">
        <button onClick={handlePrevMonth}>← Prev</button>
        <span className="calendar-month-year">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={handleNextMonth}>Next →</button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={{ fontWeight: 'bold', opacity: 0.7, fontSize: '11px' }}>
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}
            onClick={handleToday}
            title={day.isToday ? 'Today' : ''}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );
}
