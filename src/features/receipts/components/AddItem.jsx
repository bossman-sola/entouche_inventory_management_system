import { useState } from 'react';

const ITEMS_DB = [
  { id: 1, emoji: '💻', name: 'Dell Latitude 5440',    sku: 'LAP-001', cat: 'Laptops',     unit: 'Piece (PCS)', stock: 120, low: false },
  { id: 2, emoji: '🖨️', name: 'HP LaserJet Pro M428',  sku: 'PRN-001', cat: 'Printers',    unit: 'Piece (PCS)', stock: 85,  low: false },
  { id: 3, emoji: '🔗', name: 'USB-C Hub 7-in-1',       sku: 'ACC-003', cat: 'Accessories', unit: 'Piece (PCS)', stock: 250, low: false },
  { id: 4, emoji: '🪑', name: 'Ergonomic Office Chair', sku: 'CHR-002', cat: 'Furniture',   unit: 'Piece (PCS)', stock: 45,  low: false },
  { id: 5, emoji: '🖱️', name: 'Wireless Mouse',         sku: 'ACC-005', cat: 'Accessories', unit: 'Piece (PCS)', stock: 300, low: false },
  { id: 6, emoji: '🖥️', name: '24" LED Monitor',        sku: 'MON-001', cat: 'Monitors',    unit: 'Piece (PCS)', stock: 60,  low: true  },
];

export default function AddItemPicker({ isOpen, onClose, onAddItem, onCreateNew, addedItemIds = [] }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = ITEMS_DB.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.cat.toLowerCase().includes(q)
    );
  });

  const handleAdd = (item) => {
    if (addedItemIds.includes(item.id)) return;
    onAddItem(item);
  };

  return (
    <>
      {/* Styles */}
      <style>{`
        .aip-overlay {
          position: fixed; inset: 0; z-index: 10001;
          background: rgba(15,20,40,0.5);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 16px; overflow-y: auto;
          font-family: Inter, system-ui, sans-serif;
        }
        .aip-dialog {
          background: #fff; border-radius: 14px; width: 100%; max-width: 760px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.22); overflow: hidden;
        }
        .aip-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 22px 24px 16px;
        }
        .aip-title { font-size: 18px; font-weight: 700; color: #1e2740; }
        .aip-sub   { font-size: 12.5px; color: #6b7591; margin-top: 4px; }
        .aip-close-btn {
          width: 32px; height: 32px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; border-radius: 8px;
          border: 1px solid #e4e7ef; background: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .aip-close-btn:hover { background: #f4f6fb; }
        .aip-search-wrap { padding: 0 24px 16px; }
        .aip-search-row  { display: flex; align-items: center; gap: 10px; }
        .aip-search-box  { flex: 1; position: relative; }
        .aip-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none;
        }
        .aip-search-input {
          width: 100%; padding: 11px 14px 11px 42px;
          border: 1.5px solid #e4e7ef; border-radius: 9px;
          font-size: 13px; color: #1e2740; font-family: inherit;
          outline: none; transition: border 0.15s;
        }
        .aip-search-input:focus { border-color: #4f6ef7; }
        .aip-search-input::placeholder { color: #b0b8cc; }
        .aip-filter-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border: 1.5px solid #e4e7ef; border-radius: 9px;
          font-size: 12.5px; color: #1e2740; cursor: pointer;
          white-space: nowrap; background: #fff; font-family: inherit;
          transition: background 0.15s;
        }
        .aip-filter-btn:hover { background: #f4f6fb; }
        .aip-divider { border-top: 1px solid #e4e7ef; }
        .aip-table-wrap { border-top: 1px solid #e4e7ef; border-bottom: 1px solid #e4e7ef; }
        .aip-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .aip-thead tr { background: #f8f9fb; border-bottom: 1px solid #e4e7ef; }
        .aip-th {
          text-align: left; padding: 11px 12px;
          color: #6b7591; font-weight: 500; white-space: nowrap;
        }
        .aip-th:first-child { padding-left: 24px; }
        .aip-tr { transition: background 0.15s; cursor: pointer; }
        .aip-tr:not(:last-child) { border-bottom: 1px solid #f4f6fb; }
        .aip-tr:hover { background: #f8f9fb; }
        .aip-td { padding: 13px 12px; }
        .aip-td:first-child { padding-left: 24px; }
        .aip-item-cell { display: flex; align-items: center; gap: 12px; }
        .aip-item-icon {
          width: 44px; height: 44px; background: #f4f6fb;
          border: 1px solid #e4e7ef; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .aip-item-name { font-size: 13px; font-weight: 600; color: #1e2740; }
        .aip-item-cat  { font-size: 11.5px; color: #9aa1b4; margin-top: 2px; }
        .aip-td-text   { font-size: 13px; color: #6b7591; }
        .aip-stock-num { font-size: 14px; font-weight: 700; color: #1e2740; line-height: 1.2; }
        .aip-stock-label { font-size: 11.5px; font-weight: 500; margin-top: 2px; }
        .aip-add-btn {
          width: 34px; height: 34px; border: 1.5px solid #e4e7ef;
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; background: #fff;
          transition: all 0.15s; margin: 0 auto;
        }
        .aip-add-btn:hover { background: #eef2ff; border-color: #4f6ef7; }
        .aip-added-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: #22c27e; font-weight: 600;
        }
        .aip-footer { padding: 16px 24px; }
        .aip-footer-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .aip-create-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border: 1.5px dashed #c5d0ff;
          border-radius: 10px; cursor: pointer; background: #fafbff;
          transition: background 0.15s;
        }
        .aip-create-btn:hover { background: #eef2ff; }
        .aip-create-icon {
          width: 28px; height: 28px; background: #eef2ff; border-radius: 7px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .aip-create-label { font-size: 13px; font-weight: 600; color: #4f6ef7; }
        .aip-create-sub   { font-size: 11.5px; color: #6b7591; margin-top: 2px; }
        .aip-info-box { display: flex; align-items: flex-start; gap: 9px; max-width: 320px; }
        .aip-info-title { font-size: 12.5px; font-weight: 600; color: #1e2740; margin-bottom: 2px; }
        .aip-info-sub   { font-size: 12px; color: #6b7591; line-height: 1.4; }
        .aip-footer-btns { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
        .aip-btn-cancel {
          padding: 9px 24px; border: 1px solid #e4e7ef; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #1e2740; cursor: pointer;
          background: #fff; font-family: inherit; transition: background 0.15s;
        }
        .aip-btn-cancel:hover { background: #f4f6fb; }
        .aip-btn-done {
          padding: 9px 28px; background: #4f6ef7; border-radius: 8px;
          font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
          border: none; font-family: inherit; transition: background 0.15s;
        }
        .aip-btn-done:hover { background: #3a5be0; }
        .aip-empty {
          padding: 40px 20px; text-align: center;
          font-size: 13px; color: #6b7591;
        }
      `}</style>

      <div className="aip-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="aip-dialog">

          {/* Header */}
          <div className="aip-header">
            <div>
              <div className="aip-title">Add Item</div>
              <div className="aip-sub">Search and select an existing item to add to this receipt.</div>
            </div>
            <button className="aip-close-btn" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="aip-search-wrap">
            <div className="aip-search-row">
              <div className="aip-search-box">
                <svg className="aip-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  className="aip-search-input"
                  placeholder="Search item name, SKU, or barcode..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="aip-filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filters
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="aip-table-wrap">
            <table className="aip-table">
              <thead className="aip-thead">
                <tr>
                  <th className="aip-th">Item</th>
                  <th className="aip-th">SKU</th>
                  <th className="aip-th">Category</th>
                  <th className="aip-th">Unit</th>
                  <th className="aip-th">Current Stock</th>
                  <th style={{ padding: '11px 16px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="aip-empty">No items match your search.</td></tr>
                ) : filtered.map(item => {
                  const isAdded = addedItemIds.includes(item.id);
                  return (
                    <tr key={item.id} className="aip-tr">
                      {/* Item */}
                      <td className="aip-td">
                        <div className="aip-item-cell">
                          <div className="aip-item-icon">{item.emoji}</div>
                          <div>
                            <div className="aip-item-name">{item.name}</div>
                            <div className="aip-item-cat">{item.cat}</div>
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="aip-td aip-td-text">{item.sku}</td>
                      {/* Category */}
                      <td className="aip-td aip-td-text">{item.cat}</td>
                      {/* Unit */}
                      <td className="aip-td aip-td-text">{item.unit}</td>
                      {/* Stock */}
                      <td className="aip-td">
                        <div className="aip-stock-num">{item.stock}</div>
                        <div className="aip-stock-label" style={{ color: item.low ? '#f59e0b' : '#22c27e' }}>
                          {item.low ? 'Low Stock' : 'In Stock'}
                        </div>
                      </td>
                      {/* Add Button */}
                      <td className="aip-td" style={{ textAlign: 'center', padding: '13px 16px' }}>
                        {isAdded ? (
                          <div className="aip-added-badge">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Added
                          </div>
                        ) : (
                          <button className="aip-add-btn" onClick={() => handleAdd(item)} title="Add to receipt">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="aip-footer">
            <div className="aip-footer-top">
              {/* Create New Item */}
              <button className="aip-create-btn" onClick={onCreateNew}>
                <div className="aip-create-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <div className="aip-create-label">Create New Item</div>
                  <div className="aip-create-sub">Item not in the list? Create a new item.</div>
                </div>
              </button>

              {/* Info Note */}
              <div className="aip-info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <div className="aip-info-title">Can't find the item you're looking for?</div>
                  <div className="aip-info-sub">You can create a new item and add it to this receipt.</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="aip-footer-btns">
              <button className="aip-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="aip-btn-done" onClick={onClose}>Done</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
