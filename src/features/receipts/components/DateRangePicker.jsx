import { useState, useEffect } from 'react';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtShort(d) {
  if (!d) return '';
  return `${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const QUICK_RANGES = (today) => ([
  { label: 'Today', start: startOfDay(today), end: startOfDay(today) },
  { label: 'Last 7 days', start: startOfDay(addDays(today, -6)), end: startOfDay(today) },
  { label: 'Last 30 days', start: startOfDay(addDays(today, -29)), end: startOfDay(today) },
  { label: 'This month', start: new Date(today.getFullYear(), today.getMonth(), 1), end: startOfDay(today) },
  { label: 'Last month', start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) },
]);

export default function DateRangePicker({ isOpen, onClose, onApply, initialStart, initialEnd }) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(initialStart || today);
  const [selStart, setSelStart] = useState(initialStart || null);
  const [selEnd, setSelEnd] = useState(initialEnd || null);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelStart(initialStart || null);
      setSelEnd(initialEnd || null);
      setViewDate(initialStart || today);
      setHoverDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDayClick = (d) => {
    if (!d) return;
    if (!selStart || (selStart && selEnd)) {
      setSelStart(d);
      setSelEnd(null);
    } else if (selStart && !selEnd) {
      if (d < selStart) {
        setSelEnd(selStart);
        setSelStart(d);
      } else {
        setSelEnd(d);
      }
    }
  };

  const rangeStart = selStart;
  const rangeEnd = selEnd || (selStart && hoverDate && hoverDate > selStart ? hoverDate : null);
  const rangeEndForCompare = selEnd || (selStart && hoverDate ? (hoverDate < selStart ? selStart : hoverDate) : null);
  const rangeStartForCompare = selStart && hoverDate && !selEnd && hoverDate < selStart ? hoverDate : selStart;

  const cellsCurrent = buildMonthGrid(viewDate);
  const nextMonthDate = addMonths(viewDate, 1);
  const cellsNext = buildMonthGrid(nextMonthDate);

  const inRange = (d) => {
    if (!d || !rangeStartForCompare || !rangeEndForCompare) return false;
    return d > rangeStartForCompare && d < rangeEndForCompare;
  };
  const isRangeEdge = (d, edge) => {
    if (!d) return false;
    if (edge === 'start') return isSameDay(d, rangeStartForCompare);
    return isSameDay(d, rangeEndForCompare);
  };

  const renderMonth = (cells, label) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#1e2740', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10.5, color: '#9aa1b4', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = isSameDay(d, today);
          const isEdge = isRangeEdge(d, 'start') || isRangeEdge(d, 'end');
          const inMid = inRange(d);
          const isFuture = d > today;
          return (
            <div
              key={i}
              onMouseEnter={() => !selEnd && setHoverDate(d)}
              onClick={() => handleDayClick(d)}
              style={{
                aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, borderRadius: 7, cursor: 'pointer', userSelect: 'none',
                background: isEdge ? '#4f6ef7' : inMid ? '#eaf0ff' : 'transparent',
                color: isEdge ? '#fff' : isFuture ? '#c5cbdb' : '#1e2740',
                fontWeight: isEdge ? 700 : isToday ? 700 : 400,
                border: isToday && !isEdge ? '1.5px solid #4f6ef7' : '1.5px solid transparent',
                transition: 'background .1s',
              }}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 500,
        background: '#fff', border: '1px solid #e4e7ef', borderRadius: 12,
        boxShadow: '0 12px 32px rgba(20,25,50,0.16)', padding: 16,
        width: 560, fontFamily: 'Inter,system-ui,sans-serif',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', gap: 14 }}>

        {/* Quick ranges */}
        <div style={{ width: 130, borderRight: '1px solid #f0f2f7', paddingRight: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {QUICK_RANGES(today).map(q => (
            <div
              key={q.label}
              onClick={() => { setSelStart(q.start); setSelEnd(q.end); setViewDate(q.start); }}
              style={{
                fontSize: 12, padding: '7px 9px', borderRadius: 7, cursor: 'pointer',
                color: '#3d4a63', background: (isSameDay(selStart, q.start) && isSameDay(selEnd, q.end)) ? '#eef2ff' : 'transparent',
                fontWeight: (isSameDay(selStart, q.start) && isSameDay(selEnd, q.end)) ? 600 : 400,
              }}
              onMouseEnter={e => { if (!(isSameDay(selStart, q.start) && isSameDay(selEnd, q.end))) e.currentTarget.style.background = '#f4f6fb'; }}
              onMouseLeave={e => { if (!(isSameDay(selStart, q.start) && isSameDay(selEnd, q.end))) e.currentTarget.style.background = 'transparent'; }}
            >
              {q.label}
            </div>
          ))}
          <div
            onClick={() => { setSelStart(null); setSelEnd(null); }}
            style={{ fontSize: 12, padding: '7px 9px', borderRadius: 7, cursor: 'pointer', color: '#f25c54', fontWeight: 500, marginTop: 4 }}
          >
            Clear
          </div>
        </div>

        {/* Calendars */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              onClick={() => setViewDate(addMonths(viewDate, -1))}
              style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </div>
            <div style={{ fontSize: 12, color: '#6b7591', fontWeight: 500 }}>
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()} – {MONTH_LABELS[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}
            </div>
            <div
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18 }} onMouseLeave={() => setHoverDate(null)}>
            {renderMonth(cellsCurrent, `${MONTH_LABELS[viewDate.getMonth()]} ${viewDate.getFullYear()}`)}
            {renderMonth(cellsNext, `${MONTH_LABELS[nextMonthDate.getMonth()]} ${nextMonthDate.getFullYear()}`)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f2f7' }}>
        <div style={{ fontSize: 12, color: '#6b7591' }}>
          {selStart ? fmtShort(selStart) : 'Start date'} <span style={{ color: '#c5cbdb' }}>→</span> {selEnd ? fmtShort(selEnd) : 'End date'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ padding: '7px 16px', border: '1px solid #e4e7ef', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 500, color: '#1e2740', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            disabled={!selStart || !selEnd}
            onClick={() => { if (selStart && selEnd) { onApply(selStart, selEnd); } }}
            style={{
              padding: '7px 18px', border: 'none', borderRadius: 7,
              background: (selStart && selEnd) ? '#4f6ef7' : '#c5cedf',
              fontSize: 12, fontWeight: 600, color: '#fff',
              cursor: (selStart && selEnd) ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}