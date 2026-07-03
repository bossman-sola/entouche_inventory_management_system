import { useState } from "react";
import { MONTHS, SHORT_MONTHS, DAYS } from "../constants/transactionsData.js";
import { ChevLeft, ChevRight } from "./icons.jsx";

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DateRangePicker({ isOpen, initialStart, initialEnd, onClose, onApply }) {
  const today = startOfDay(new Date());
  const [hovered, setHovered] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [viewYear, setViewYear] = useState((initialStart || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((initialStart || today).getMonth());
  const [localStart, setLocalStart] = useState(initialStart || null);
  const [localEnd, setLocalEnd] = useState(initialEnd || null);

  if (!isOpen) return null;

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const total = daysInMonth(viewYear, viewMonth);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const handleDayClick = (day) => {
    const clicked = new Date(viewYear, viewMonth, day);
    if (!selecting) {
      setSelecting(clicked);
      setLocalStart(clicked);
      setLocalEnd(null);
    } else {
      const s = selecting <= clicked ? selecting : clicked;
      const e = selecting <= clicked ? clicked : selecting;
      setLocalStart(s);
      setLocalEnd(e);
      setSelecting(null);
    }
  };

  const isStart = (day) => localStart && startOfDay(localStart).getTime() === new Date(viewYear, viewMonth, day).getTime();
  const isEnd   = (day) => localEnd   && startOfDay(localEnd).getTime()   === new Date(viewYear, viewMonth, day).getTime();
  const inRange = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const end = selecting ? hovered : localEnd;
    if (!localStart || !end) return false;
    const s = localStart <= end ? localStart : end;
    const e = localStart <= end ? end : localStart;
    return d > s && d < e;
  };

  const presets = [
    { label: "Today", fn: () => { setLocalStart(today); setLocalEnd(today); setSelecting(null); } },
    { label: "Last 7 days", fn: () => { const s = new Date(today); s.setDate(s.getDate()-6); setLocalStart(s); setLocalEnd(today); setSelecting(null); } },
    { label: "Last 30 days", fn: () => { const s = new Date(today); s.setDate(s.getDate()-29); setLocalStart(s); setLocalEnd(today); setSelecting(null); } },
    { label: "This month", fn: () => { setLocalStart(new Date(today.getFullYear(),today.getMonth(),1)); setLocalEnd(today); setSelecting(null); } },
    { label: "Last month", fn: () => {
      const y = today.getMonth()===0 ? today.getFullYear()-1 : today.getFullYear();
      const m = today.getMonth()===0 ? 11 : today.getMonth()-1;
      setLocalStart(new Date(y,m,1)); setLocalEnd(new Date(y,m+1,0)); setSelecting(null);
    }},
  ];

  const fmtDate = (d) => d ? `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";

  return (
    <div style={{
      position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 500,
      background: "#fff", border: "1px solid #e4e7ef", borderRadius: 12,
      boxShadow: "0 8px 32px rgba(20,25,50,0.16)", display: "flex", overflow: "hidden",
      minWidth: 520,
    }}>
      {/* Presets */}
      <div style={{ padding: "16px 0", borderRight: "1px solid #e4e7ef", minWidth: 130 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa1b4", padding: "0 16px 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick select</div>
        {presets.map(p => (
          <div key={p.label} onClick={p.fn}
            style={{ padding: "8px 16px", fontSize: 12.5, cursor: "pointer", color: "#1e2740" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >{p.label}</div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div onClick={prevMonth}
            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          ><ChevLeft /></div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{MONTHS[viewMonth]} {viewYear}</div>
          <div onClick={nextMonth}
            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          ><ChevRight /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)", gap: 2, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#9aa1b4", fontWeight: 500, padding: "2px 0" }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)", gap: 2 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
          {Array.from({ length: total }, (_, i) => i + 1).map(day => {
            const s = isStart(day), e = isEnd(day), r = inRange(day);
            return (
              <div key={day}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => selecting && setHovered(new Date(viewYear, viewMonth, day))}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: s || e ? 8 : r ? 0 : 8,
                  background: s || e ? "#4f6ef7" : r ? "#eef1fe" : "",
                  color: s || e ? "#fff" : "#1e2740",
                  fontSize: 12.5, cursor: "pointer", fontWeight: s || e ? 600 : 400,
                }}
              >{day}</div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#6b7591" }}>
            {localStart ? fmtDate(localStart) : "Start"}{localEnd ? ` → ${fmtDate(localEnd)}` : selecting ? " → pick end" : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "6px 14px", border: "1px solid #e4e7ef", borderRadius: 7, background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button
              onClick={() => { if (localStart && localEnd) onApply(localStart, localEnd); }}
              disabled={!localStart || !localEnd}
              style={{ padding: "6px 14px", border: "none", borderRadius: 7, background: localStart && localEnd ? "#4f6ef7" : "#c5ccf5", color: "#fff", fontSize: 12, cursor: localStart && localEnd ? "pointer" : "default", fontFamily: "inherit" }}
            >Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}