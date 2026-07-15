export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
export const isBetween = (d, a, b) => a && b && d > a && d < b;

export const formatShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const formatFull = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatRangeLabel = (start, end) => {
  if (sameDay(start, end)) return formatFull(start);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${formatShort(start)} – ${formatShort(end)}, ${end.getFullYear()}`;
  }
  return `${formatFull(start)} – ${formatFull(end)}`;
};

export const buildPresets = () => {
  const today = new Date();
  return [
    { key: "today", label: "Today", start: startOfDay(today), end: endOfDay(today) },
    { key: "last7", label: "Last 7 days", start: startOfDay(addDays(today, -6)), end: endOfDay(today) },
    { key: "last30", label: "Last 30 days", start: startOfDay(addDays(today, -29)), end: endOfDay(today) },
    { key: "thisMonth", label: "This month", start: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)), end: endOfDay(today) },
    { key: "lastMonth", label: "Last month", start: startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1)), end: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)) },
  ];
};

export const buildMonthGrid = (year, month) => {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const gridStart = addDays(firstOfMonth, -startWeekday);
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
};

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
