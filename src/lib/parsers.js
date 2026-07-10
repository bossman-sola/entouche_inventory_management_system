import * as XLSX from "xlsx";

export function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

export function normalizeName(s) {
  return String(s || "").trim().toLowerCase();
}

export function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map(l => l.split(",").map(c => c.trim().replace(/"/g, "")));
  return { headers, rows };
}

export function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
        const headers = (grid[0] || []).map(h => String(h));
        const rows = grid.slice(1).map(r => headers.map((_, i) => (r[i] === undefined ? "" : String(r[i]))));
        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}