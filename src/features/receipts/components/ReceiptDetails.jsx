import { useState } from 'react';

const statusStyle = {
  Received: { bg: '#e6faf3', color: '#16a369' },
  Draft: { bg: '#fff7ed', color: '#c27a0a' },
  Cancelled: { bg: '#fff1f0', color: '#c0392b' },
};

function fmtNaira(n) {
  return '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const TimelineDot = ({ done }) => (
  <div style={{
    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
    background: done ? '#22c27e' : '#eef0f6',
    border: done ? 'none' : '2px solid #d7dbe8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {done && (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </div>
);

export default function ReceiptDetails({ isOpen, receipt, onClose, onEdit }) {
  const [tab, setTab] = useState('items');

  if (!isOpen || !receipt) return null;

  const s = statusStyle[receipt.status] || statusStyle.Draft;
  const items = receipt.items || [];
  const totItems = items.length;
  const totQty = items.reduce((a, r) => a + Number(r.qty || 0), 0);
  const totCost = items.reduce((a, r) => a + Number(r.qty || 0) * Number(r.cost || 0), 0);
  const discount = Number(receipt.discount || 0);
  const otherCharges = Number(receipt.otherCharges || 0);
  const grandTotal = totCost - discount + otherCharges;

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        .rcd-overlay {
          position: absolute; inset: 0; z-index: 9998;
         
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 16px; overflow-y: auto;
          font-family: Inter, system-ui, sans-serif;
        }
        .rcd-card {
          background: #fff; border-radius: 14px; width: 100%; max-width: 1140px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2); border: 1px solid #e4e7ef; overflow: hidden;
        }
        .rcd-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 20px 24px 16px;
        }
        .rcd-title { font-size: 19px; font-weight: 700; color: #1e2740; }
        .rcd-close-btn {
          width: 32px; height: 32px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; border-radius: 8px;
          border: 1px solid #e4e7ef; background: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .rcd-close-btn:hover { background: #f4f6fb; }
        .rcd-summary-bar {
          background: #f8f9fb; border-top: 1px solid #e4e7ef; border-bottom: 1px solid #e4e7ef;
          padding: 14px 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .rcd-dl-icon {
          width: 40px; height: 40px; background: #eef2ff; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;
        }
        .rcd-no { font-size: 16px; font-weight: 700; color: #1e2740; }
        .rcd-meta { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #6b7591; margin-top: 3px; }
        .rcd-stat-label { font-size: 10.5px; color: #9aa1b4; margin-bottom: 2px; }
        .rcd-stat-val { font-size: 13px; font-weight: 600; color: #1e2740; }
        .rcd-body { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; }
        .rcd-info-col { padding: 18px 22px; border-right: 1px solid #e4e7ef; }
        .rcd-info-col:last-child { border-right: none; }
        .rcd-col-title { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; color: #1e2740; margin-bottom: 14px; }
        .rcd-col-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rcd-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 10px; }
        .rcd-flabel { font-size: 11px; color: #9aa1b4; margin-bottom: 4px; }
        .rcd-fval { font-size: 12.5px; font-weight: 600; color: #1e2740; }
        .rcd-fval.link { color: #4f6ef7; cursor: pointer; }
        .rcd-notes-block { margin-top: 14px; }
        .rcd-sum-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f0f2f7; font-size: 12.5px; }
        .rcd-sum-row span:first-child { color: #6b7591; }
        .rcd-sum-row span:last-child { font-weight: 600; color: #1e2740; }
        .rcd-grand { display: flex; align-items: center; justify-content: space-between; background: #eef2ff; border-radius: 8px; padding: 10px 12px; margin-top: 10px; }
        .rcd-grand span:first-child { font-size: 12.5px; font-weight: 600; color: #4f6ef7; }
        .rcd-grand span:last-child { font-size: 14px; font-weight: 700; color: #4f6ef7; }
        .rcd-tabs-wrap { display: grid; grid-template-columns: 1fr 280px; border-top: 1px solid #e4e7ef; }
        .rcd-main { padding: 0 22px 18px; border-right: 1px solid #e4e7ef; }
        .rcd-tabs { display: flex; gap: 22px; border-bottom: 1px solid #e4e7ef; padding-top: 4px; }
        .rcd-tab { padding: 13px 2px; font-size: 12.5px; font-weight: 500; color: #6b7591; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 2px solid transparent; }
        .rcd-tab.active { color: #4f6ef7; font-weight: 600; border-bottom-color: #4f6ef7; }
        .rcd-items-table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-top: 12px; }
        .rcd-items-table th { text-align: left; padding: 9px 8px; color: #6b7591; font-weight: 500; border-bottom: 1px solid #e4e7ef; white-space: nowrap; }
        .rcd-items-table td { padding: 11px 8px; border-bottom: 1px solid #f4f6fb; }
        .rcd-items-table tfoot td { border-bottom: none; border-top: 1px solid #e4e7ef; font-weight: 700; color: #1e2740; padding-top: 12px; }
        .rcd-item-name { font-weight: 600; color: #1e2740; }
        .rcd-item-cat { font-size: 11px; color: #9aa1b4; margin-top: 1px; }
        .rcd-side { padding: 18px 18px; background: #fafbfd; }
        .rcd-side-title { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; color: #1e2740; margin-bottom: 16px; }
        .rcd-tl-item { display: flex; gap: 10px; padding-bottom: 18px; position: relative; }
        .rcd-tl-item:not(:last-child)::before {
          content: ''; position: absolute; left: 10.5px; top: 22px; bottom: 0; width: 2px; background: #e8eaf0;
        }
        .rcd-tl-title { font-size: 12.5px; font-weight: 600; color: #1e2740; }
        .rcd-tl-date { font-size: 11px; color: #9aa1b4; margin-top: 2px; }
        .rcd-empty-tab { padding: 40px 10px; text-align: center; color: #9aa1b4; font-size: 12.5px; }
        .rcd-footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid #e4e7ef; background: #fff; }
        .rcd-btn-print { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border: 1px solid #e4e7ef; border-radius: 8px; background: #fff; font-size: 12.5px; font-weight: 500; color: #1e2740; cursor: pointer; font-family: inherit; }
        .rcd-btn-print:hover { background: #f4f6fb; }
        .rcd-btn-close { padding: 9px 22px; border: 1px solid #e4e7ef; border-radius: 8px; background: #fff; font-size: 12.5px; font-weight: 500; color: #1e2740; cursor: pointer; font-family: inherit; }
        .rcd-btn-close:hover { background: #f4f6fb; }
        .rcd-btn-edit { padding: 9px 22px; border: none; border-radius: 8px; background: #4f6ef7; font-size: 12.5px; font-weight: 600; color: #fff; cursor: pointer; font-family: inherit; }
        .rcd-btn-edit:hover { background: #3a5be0; }

        @media print {
          body * { visibility: hidden; }
          #rcd-print-area, #rcd-print-area * { visibility: visible; }
          #rcd-print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
          .rcd-overlay { position: static; background: none; padding: 0; }
          .rcd-close-btn, .rcd-footer, .rcd-tabs, .rcd-side { display: none !important; }
        }
      `}</style>

      <div className="rcd-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="rcd-card" id="rcd-print-area">

          {/* Header */}
          <div className="rcd-header">
            <div className="rcd-title">Receipt Details</div>
            <button className="rcd-close-btn" onClick={onClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Summary bar */}
          <div className="rcd-summary-bar">
            <div className="rcd-dl-icon" onClick={handlePrint} title="Print receipt">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div style={{ marginRight: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="rcd-no">{receipt.no}</span>
                <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{receipt.status}</span>
              </div>
              <div className="rcd-meta">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {receipt.date}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2" style={{ marginLeft: 6 }}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>
                {receipt.by}
              </div>
            </div>
            <div><div className="rcd-stat-label">Supplier</div><div className="rcd-stat-val">{receipt.supplier}</div></div>
            <div><div className="rcd-stat-label">Reference / PO No.</div><div className="rcd-stat-val">{receipt.ref}</div></div>
            <div><div className="rcd-stat-label">Total Items</div><div className="rcd-stat-val">{totItems}</div></div>
            <div><div className="rcd-stat-label">Total Quantity</div><div className="rcd-stat-val">{totQty}</div></div>
            <div><div className="rcd-stat-label">Total Value</div><div className="rcd-stat-val">{fmtNaira(totCost)}</div></div>
          </div>

          {/* 3 info columns */}
          <div className="rcd-body">
            <div className="rcd-info-col">
              <div className="rcd-col-title">
                <span className="rcd-col-icon" style={{ background: '#eef2ff' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </span>
                Receipt Information
              </div>
              <div className="rcd-field-grid">
                <div><div className="rcd-flabel">Receipt Number</div><div className="rcd-fval">{receipt.no}</div></div>
                <div><div className="rcd-flabel">Receipt Date</div><div className="rcd-fval">{receipt.date}</div></div>
                <div><div className="rcd-flabel">Reference / PO No.</div><div className="rcd-fval">{receipt.ref}</div></div>
                <div><div className="rcd-flabel">Supplier</div><div className="rcd-fval link">{receipt.supplier}</div></div>
                <div><div className="rcd-flabel">Received By</div><div className="rcd-fval">{receipt.by}</div></div>
                <div><div className="rcd-flabel">Delivery Note No.</div><div className="rcd-fval">{receipt.deliveryNoteNo}</div></div>
              </div>
              <div className="rcd-notes-block">
                <div className="rcd-flabel">Notes</div>
                <div className="rcd-fval" style={{ fontWeight: 400, color: '#3d4a63', lineHeight: 1.5 }}>{receipt.notes || 'No additional notes.'}</div>
              </div>
            </div>

            <div className="rcd-info-col">
              <div className="rcd-col-title">
                <span className="rcd-col-icon" style={{ background: '#e6faf3' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </span>
                Delivery &amp; Location
              </div>
              <div className="rcd-field-grid">
                <div><div className="rcd-flabel">Delivery Date</div><div className="rcd-fval">{receipt.deliveryDate}</div></div>
                <div><div className="rcd-flabel">Warehouse</div><div className="rcd-fval">{receipt.warehouse}</div></div>
                <div><div className="rcd-flabel">Receiving Location</div><div className="rcd-fval">{receipt.receivingLocation}</div></div>
                <div><div className="rcd-flabel">Storage Location</div><div className="rcd-fval">{receipt.storageLocation}</div></div>
              </div>
            </div>

            <div className="rcd-info-col">
              <div className="rcd-col-title">
                <span className="rcd-col-icon" style={{ background: '#f3f0ff' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="9" x2="22" y2="9" /></svg>
                </span>
                Receipt Summary
              </div>
              <div className="rcd-sum-row"><span>Total Items</span><span>{totItems}</span></div>
              <div className="rcd-sum-row"><span>Total Quantity</span><span>{totQty}</span></div>
              <div className="rcd-sum-row"><span>Total Value</span><span>{fmtNaira(totCost)}</span></div>
              <div className="rcd-sum-row"><span>Discount</span><span>{fmtNaira(discount)}</span></div>
              <div className="rcd-sum-row" style={{ borderBottom: 'none' }}><span>Other Charges</span><span>{fmtNaira(otherCharges)}</span></div>
              <div className="rcd-grand"><span>Grand Total</span><span>{fmtNaira(grandTotal)}</span></div>
            </div>
          </div>

          {/* Tabs + timeline */}
          <div className="rcd-tabs-wrap">
            <div className="rcd-main">
              <div className="rcd-tabs">
                <div className={`rcd-tab${tab === 'items' ? ' active' : ''}`} onClick={() => setTab('items')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  Items ({totItems})
                </div>
                <div className={`rcd-tab${tab === 'attachments' ? ' active' : ''}`} onClick={() => setTab('attachments')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  Attachments ({(receipt.attachments || []).length})
                </div>
                <div className={`rcd-tab${tab === 'activity' ? ' active' : ''}`} onClick={() => setTab('activity')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  Activity Log ({(receipt.timeline || []).length})
                </div>
              </div>

              {tab === 'items' && (
                <table className="rcd-items-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Item</th><th>SKU</th><th>Unit</th>
                      <th style={{ textAlign: 'center' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Unit Cost (₦)</th>
                      <th style={{ textAlign: 'right' }}>Total Cost (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={7} className="rcd-empty-tab">No items on this receipt.</td></tr>
                    ) : items.map((it, i) => (
                      <tr key={it.id || i}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="rcd-item-name">{it.name}</div>
                          <div className="rcd-item-cat">{it.cat}</div>
                        </td>
                        <td style={{ color: '#6b7591' }}>{it.sku}</td>
                        <td style={{ color: '#6b7591' }}>{it.unit}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.qty}</td>
                        <td style={{ textAlign: 'right', color: '#6b7591' }}>{Number(it.cost || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{(Number(it.qty || 0) * Number(it.cost || 0)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={4}>Total</td>
                        <td style={{ textAlign: 'center' }}>{totQty}</td>
                        <td></td>
                        <td style={{ textAlign: 'right' }}>{fmtNaira(totCost)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}

              {tab === 'attachments' && (
                (receipt.attachments || []).length === 0 ? (
                  <div className="rcd-empty-tab">No attachments on this receipt.</div>
                ) : (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {receipt.attachments.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e4e7ef', borderRadius: 8 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <span style={{ fontSize: 12.5, color: '#1e2740', fontWeight: 500 }}>{a.name}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === 'activity' && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(receipt.timeline || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
                      <TimelineDot done={t.status === 'done'} />
                      <div>
                        <div className="rcd-tl-title">{t.title}</div>
                        <div className="rcd-tl-date">{t.date} {t.by ? `by ${t.by}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rcd-side">
              <div className="rcd-side-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Receipt Timeline
              </div>
              {(receipt.timeline || []).map((t, i) => (
                <div className="rcd-tl-item" key={i}>
                  <TimelineDot done={t.status === 'done'} />
                  <div>
                    <div className="rcd-tl-title">{t.title}</div>
                    <div className="rcd-tl-date">{t.date}</div>
                    {t.by && <div className="rcd-tl-date">by {t.by}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="rcd-footer">
            <button className="rcd-btn-print" onClick={handlePrint}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Print Receipt
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="rcd-btn-close" onClick={onClose}>Close</button>
              {receipt.canEdit !== false && (
                <button className="rcd-btn-edit" onClick={() => onEdit && onEdit(receipt)}>Edit Receipt</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}