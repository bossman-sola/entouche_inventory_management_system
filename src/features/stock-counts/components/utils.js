export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}


export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}


export function printCountSheet(header, items) {
  const rows = (items || [])
    .map(
      (it) => `<tr>
        <td>${it.name ?? "-"}</td>
        <td>${it.sku ?? "-"}</td>
        <td>${it.location ?? "-"}</td>
        <td style="text-align:right">${it.systemQty ?? "-"}</td>
        <td style="text-align:right">${it.countedQty ?? ""}</td>
        <td style="text-align:right">${it.variance ?? ""}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
    <html><head><title>${header?.countNo || "Stock Count"} — Count Sheet</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; }
    </style></head>
    <body>
      <h1>${header?.countNo || "Stock Count"} — Count Sheet</h1>
      <div class="meta">
        Warehouse: ${header?.warehouse || "-"} &nbsp;•&nbsp;
        Location: ${header?.location || "-"} &nbsp;•&nbsp;
        Status: ${header?.status || "-"} &nbsp;•&nbsp;
        Date: ${header?.scheduledDate || "-"}
      </div>
      <table>
        <thead><tr>
          <th>Item</th><th>SKU</th><th>Location</th>
          <th>System Qty</th><th>Counted Qty</th><th>Variance</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="6">No items</td></tr>`}</tbody>
      </table>
      <script>window.onload = () => { window.print(); };</script>
    </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return; 
  win.document.write(html);
  win.document.close();
}
