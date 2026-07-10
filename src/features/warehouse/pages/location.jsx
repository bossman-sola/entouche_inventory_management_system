import { useEffect, useMemo, useState } from 'react';
import {
  Search, RefreshCw, List, LayoutGrid, ChevronsUpDown,
  Plus, X, Info, Edit2, Trash2, Warehouse, CheckCircle2, Wallet, Layers,
  Download, Archive, ArrowRight, AlertTriangle, ChevronLeft, ChevronRight,
  PackageSearch, PlugZap,
} from 'lucide-react';
import { locationsApi } from '../api/locationsApi';
import './location.css';


const TYPE_META = {
  Receiving: { icon: Download, iconClass: 'indigo', codeClass: 'code-indigo', typeClass: 'type-receiving' },
  Storage: { icon: Archive, iconClass: 'green', codeClass: 'code-green', typeClass: 'type-storage' },
  Dispatch: { icon: ArrowRight, iconClass: 'orange', codeClass: 'code-orange', typeClass: 'type-dispatch' },
  Damaged: { icon: AlertTriangle, iconClass: 'red', codeClass: 'code-red', typeClass: 'type-damaged' },
};

const LOCATION_TYPES = Object.keys(TYPE_META);

const currency = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

const emptyForm = { name: '', code: '', type: '', description: '', warehouse: '' };

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true); 

  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [viewMode, setViewMode] = useState('list');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadLocations() {
    setLoading(true);
    try {
      const data = await locationsApi.list();
      setLocations(data ?? []);
      setConnected(true);
    } catch {
      
      setLocations([]);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLocations(); }, []);

  
  const warehouseOptions = useMemo(
    () => ['All Warehouses', ...Array.from(new Set(locations.map((l) => l.warehouse).filter(Boolean)))],
    [locations]
  );

  
  const filteredLocations = useMemo(() => {
    let rows = [...locations];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      rows = rows.filter((l) =>
        l.name?.toLowerCase().includes(q) ||
        l.code?.toLowerCase().includes(q) ||
        l.type?.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
      );
    }
    if (warehouseFilter !== 'All Warehouses') {
      rows = rows.filter((l) => l.warehouse === warehouseFilter);
    }
    if (statusFilter !== 'All Status') {
      rows = rows.filter((l) => l.status === statusFilter.toLowerCase());
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [locations, searchTerm, warehouseFilter, statusFilter, sortKey, sortDir]);

  
  const stats = useMemo(() => {
    const total = locations.length;
    const active = locations.filter((l) => l.status === 'active').length;
    const totalValue = locations.reduce((sum, l) => sum + (l.stockValue || 0), 0);
    const totalStock = locations.reduce((sum, l) => sum + (l.currentStock || 0), 0);
    const activePct = total ? Math.round((active / total) * 100) : 0;
    return { total, active, totalValue, totalStock, activePct };
  }, [locations]);

 
  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / perPage));
  const pageRows = filteredLocations.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [searchTerm, warehouseFilter, statusFilter, perPage]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  
  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(loc) {
    setEditingId(loc.id);
    setForm({
      name: loc.name || '',
      code: loc.code || '',
      type: loc.type || '',
      description: loc.description || '',
      warehouse: loc.warehouse || '',
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Location name is required';
    if (!form.code.trim()) errs.code = 'Code is required';
    if (!form.type) errs.type = 'Select a type';
    if (!form.warehouse.trim()) errs.warehouse = 'Warehouse is required';
    return errs;
  }

  async function handleSave() {
    const errs = validateForm();
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (editingId) {
        const updated = await locationsApi.update(editingId, form);
        setLocations((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
        showToast('Location updated');
      } else {
        const created = await locationsApi.create(form);
        setLocations((prev) => [...prev, created]);
        showToast('Location created');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(
        err.message || "Couldn't save this location — the Locations service isn't connected yet.",
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(loc) {
    if (!window.confirm(`Delete "${loc.name}"? This can't be undone.`)) return;
    try {
      await locationsApi.remove(loc.id);
      setLocations((prev) => prev.filter((l) => l.id !== loc.id));
      showToast('Location deleted');
    } catch (err) {
      showToast(
        err.message || "Couldn't delete this location — the Locations service isn't connected yet.",
        'error'
      );
    }
  }

  const startRow = filteredLocations.length ? (page - 1) * perPage + 1 : 0;
  const endRow = Math.min(page * perPage, filteredLocations.length);

  return (
    <div className="loc-page">
      <div className="page-head">
        <div>
          <h1>Warehouse Locations</h1>
          <p className="page-sub">Manage all locations within your warehouse.</p>
          <div className="crumbs">Warehouse<span className="sep">&rsaquo;</span><span className="current">Locations</span></div>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={16} strokeWidth={2.5} />
          Add Location
        </button>
      </div>

      {!loading && !connected && (
        <div className="api-note">
          <PlugZap size={15} />
          Not connected to the Locations API yet — this page will populate automatically once it's available.
        </div>
      )}

      {/* Stats */}
      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon indigo"><Warehouse size={22} /></div>
            <div>
              <div className="stat-label">Total Locations</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-foot">Across all warehouses</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon green"><CheckCircle2 size={22} /></div>
            <div>
              <div className="stat-label">Active Locations</div>
              <div className="stat-value">{stats.active}</div>
            </div>
          </div>
          <div className="stat-foot"><span className="pos">{stats.activePct}%</span> of total locations</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon orange"><Wallet size={22} /></div>
            <div>
              <div className="stat-label">Total Stock Value</div>
              <div className="stat-value">{currency(stats.totalValue)}</div>
            </div>
          </div>
          <div className="stat-foot">Across all locations</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon blue"><Layers size={22} /></div>
            <div>
              <div className="stat-label">Total Stock</div>
              <div className="stat-value">{stats.totalStock.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-foot">Total quantity in stock</div>
        </div>
      </section>

      {/* Table */}
      <section className="table-card">
        <div className="table-tools">
          <div className="loc-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="select" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            {warehouseOptions.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>

          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <div className="tools-right">
            <button className="tool-btn" aria-label="Refresh" onClick={loadLocations} disabled={loading}>
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
            </button>
            <button
              className={`tool-btn ${viewMode === 'list' ? 'active' : ''}`}
              aria-label="List view"
              onClick={() => setViewMode('list')}
            >
              <List size={17} />
            </button>
            <button
              className={`tool-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={17} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')}>Location Name <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th onClick={() => toggleSort('code')}>Code <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th onClick={() => toggleSort('type')}>Type <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th>Description</th>
                <th onClick={() => toggleSort('currentStock')}>Current Stock <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th onClick={() => toggleSort('stockValue')}>Stock Value <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th onClick={() => toggleSort('status')}>Status <span className="sort"><ChevronsUpDown size={12} /></span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="empty-state">Loading locations…</td></tr>
              )}

              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <PackageSearch size={32} />
                      <div>
                        {locations.length === 0
                          ? (connected ? 'No locations yet. Add one to get started.' : 'No locations to show yet.')
                          : 'No locations match your filters.'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && pageRows.map((loc) => {
                const meta = TYPE_META[loc.type] || TYPE_META.Storage;
                const Icon = meta.icon;
                return (
                  <tr key={loc.id}>
                    <td>
                      <div className="loc-cell">
                        <div className={`loc-icon ${meta.iconClass}`}><Icon size={18} /></div>
                        <span className="loc-name">{loc.name}</span>
                      </div>
                    </td>
                    <td><span className={`pill ${meta.codeClass}`}>{loc.code}</span></td>
                    <td><span className={`pill ${meta.typeClass}`}>{loc.type}</span></td>
                    <td>{loc.description}</td>
                    <td className="num">{(loc.currentStock || 0).toLocaleString()}</td>
                    <td className="money">{currency(loc.stockValue)}</td>
                    <td><span className={`pill status-${loc.status}`}>{loc.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="actions">
                        <button className="action edit" aria-label={`Edit ${loc.name}`} onClick={() => openEditModal(loc)}>
                          <Edit2 size={17} />
                        </button>
                        <button className="action del" aria-label={`Delete ${loc.name}`} onClick={() => handleDelete(loc)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <div className="foot-info">
            {filteredLocations.length
              ? `Showing ${startRow} to ${endRow} of ${filteredLocations.length} locations`
              : 'Showing 0 to 0 of 0 locations'}
          </div>
          <div className="pager">
            <button className="page-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            <button className="page-btn current">{page}</button>
            <button className="page-btn" aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={15} />
            </button>
            <select
              className="select per-page"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </section>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="modal-head">
              <div>
                <div className="modal-title" id="modalTitle">{editingId ? 'Edit Location' : 'Add New Location'}</div>
                <div className="modal-sub">
                  {editingId ? 'Update this location\u2019s details.' : 'Create a new location within your warehouse.'}
                </div>
              </div>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="locName">Location Name <span className="req">*</span></label>
              <input
                type="text"
                id="locName"
                placeholder="e.g. Storage Area"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {formErrors.name && <div className="field-error">{formErrors.name}</div>}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="locCode">Code <span className="req">*</span></label>
                <input
                  type="text"
                  id="locCode"
                  placeholder="e.g. STR"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
                {formErrors.code && <div className="field-error">{formErrors.code}</div>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="locType">Type <span className="req">*</span></label>
                <select
                  id="locType"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {formErrors.type && <div className="field-error">{formErrors.type}</div>}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="locDesc">Description</label>
              <div className="textarea-wrap">
                <textarea
                  id="locDesc"
                  maxLength={150}
                  placeholder="e.g. Primary storage location for inventory items"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <span className="char-count">{form.description.length} / 150</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="locWarehouse">Warehouse <span className="req">*</span></label>
              <input
                type="text"
                id="locWarehouse"
                placeholder="e.g. Main Warehouse"
                value={form.warehouse}
                onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
              />
              {formErrors.warehouse && <div className="field-error">{formErrors.warehouse}</div>}
            </div>

            <div className="modal-note">
              <Info size={15} />
              The new location will be created under the selected warehouse.
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}