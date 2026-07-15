import { useEffect, useMemo, useState } from 'react';
import {
  Search, RefreshCw, List, LayoutGrid, ChevronsUpDown,
  Plus, X, Info, Edit2, Trash2, Warehouse, CheckCircle2, Wallet, Layers,
  Download, Archive, ArrowRight, AlertTriangle, ChevronLeft, ChevronRight,
  PackageSearch,
} from 'lucide-react';
import { locationsApi } from '../api/locationsApi';
import { warehousesApi } from '../api/warehousesApi';
import './location.css';

const TYPE_META = {
  receiving_area: { label: 'Receiving Area', icon: Download, iconClass: 'indigo', codeClass: 'code-indigo', typeClass: 'type-receiving', codePrefix: 'RA' },
  storage_area: { label: 'Storage Area', icon: Archive, iconClass: 'green', codeClass: 'code-green', typeClass: 'type-storage', codePrefix: 'STR' },
  dispatch_area: { label: 'Dispatch Area', icon: ArrowRight, iconClass: 'orange', codeClass: 'code-orange', typeClass: 'type-dispatch', codePrefix: 'DIS' },
  damaged_goods_area: { label: 'Damaged Goods Area', icon: AlertTriangle, iconClass: 'red', codeClass: 'code-red', typeClass: 'type-damaged', codePrefix: 'DMG' },
};

const LOCATION_TYPE_OPTIONS = Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label }));

const currency = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

const emptyForm = { name: '', code: '', type: '', warehouseId: '' };

const SERVER_FIELD_MAP = {
  warehouse_id: 'warehouseId',
  name: 'name',
  code: 'code',
  type: 'type',
};

function mapServerErrorsToForm(apiErrors) {
  const fieldErrors = {};
  for (const [key, msgs] of Object.entries(apiErrors || {})) {
    const formKey = SERVER_FIELD_MAP[key] || key;
    fieldErrors[formKey] = Array.isArray(msgs) ? msgs[0] : msgs;
  }
  return fieldErrors;
}

function generateLocationCode(warehouseId, type, existingLocations) {
  if (!warehouseId || !type) return '';
  const prefix = TYPE_META[type]?.codePrefix || 'LOC';
  const whPart = String(warehouseId).padStart(3, '0');
  const base = `WH-${whPart}-${prefix}`;
  const sameTypeCount = existingLocations.filter(
    (l) => String(l.warehouseId) === String(warehouseId) && l.type === type
  ).length;
  return sameTypeCount === 0 ? base : `${base}-${String(sameTypeCount + 1).padStart(2, '0')}`;
}

export default function LocationsPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    setError(null);
    try {
      const whs = await warehousesApi.listAll();
      setWarehouses(whs);

      const settled = await Promise.allSettled(
        whs.map((w) => warehousesApi.listLocations(w.id))
      );

      const flattened = settled.flatMap((r, idx) => {
        if (r.status !== 'fulfilled') return [];
        return (r.value || []).map((loc) => ({
          ...loc,
          warehouse: whs[idx].name,
          warehouseId: whs[idx].id,
        }));
      });

      setLocations(flattened);
    } catch (err) {
      setError(err.message || 'Failed to load locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLocations(); }, []);

  useEffect(() => {
    if (editingId) return;
    const nextCode = generateLocationCode(form.warehouseId, form.type, locations);
    setForm((f) => (f.code === nextCode ? f : { ...f, code: nextCode }));
  }, [form.warehouseId, form.type, editingId, locations]);

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
        (TYPE_META[l.type]?.label || l.type || '').toLowerCase().includes(q)
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
    setForm({ ...emptyForm, warehouseId: warehouses[0]?.id ? String(warehouses[0].id) : '' });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(loc) {
    setEditingId(loc.id);
    setForm({
      name: loc.name || '',
      code: loc.code || '',
      type: loc.type || '',
      warehouseId: loc.warehouseId ? String(loc.warehouseId) : '',
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
    if (!form.type) errs.type = 'Select a type';
    if (!editingId && !form.warehouseId) errs.warehouseId = 'Select a warehouse';
    return errs;
  }

  async function handleSave() {
    const errs = validateForm();
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (editingId) {
        await locationsApi.update(editingId, {
          name: form.name,
          type: form.type,
        });
        showToast('Location updated');
      } else {
        await warehousesApi.createLocation(form.warehouseId, {
          name: form.name,
          code: form.code,
          type: form.type,
          status: 'active',
        });
        showToast('Location created');
      }
      setModalOpen(false);
      await loadLocations();
    } catch (err) {
      const fieldErrors = mapServerErrorsToForm(err.errors);

      if (Object.keys(fieldErrors).length) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        showToast(Object.values(fieldErrors)[0], 'error');
      } else {
        showToast(err.message || "Couldn't save this location.", 'error');
      }
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
      showToast(err.message || "Couldn't delete this location.", 'error');
    }
  }

  async function handleToggleStatus(loc) {
    const nextStatus = loc.status === 'active' ? 'inactive' : 'active';
    try {
      await locationsApi.toggleStatus(loc.id, nextStatus);
      setLocations((prev) => prev.map((l) => (l.id === loc.id ? { ...l, status: nextStatus } : l)));
      showToast(`Location marked ${nextStatus}`);
    } catch (err) {
      showToast(err.message || "Couldn't update this location's status.", 'error');
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
        <button className="btn-primary" onClick={openAddModal} disabled={loading || warehouses.length === 0}>
          <Plus size={16} strokeWidth={2.5} />
          Add Location
        </button>
      </div>

      {!loading && error && (
        <div className="api-note error">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {!loading && !error && warehouses.length === 0 && (
        <div className="api-note">
          <Info size={15} />
          No warehouses yet - create a warehouse first, then locations can be added to it.
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
                <th onClick={() => toggleSort('warehouse')}>Warehouse <span className="sort"><ChevronsUpDown size={12} /></span></th>
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
                          ? 'No locations yet. Add one to get started.'
                          : 'No locations match your filters.'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && pageRows.map((loc) => {
                const meta = TYPE_META[loc.type] || TYPE_META.storage_area;
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
                    <td><span className={`pill ${meta.typeClass}`}>{meta.label}</span></td>
                    <td>{loc.warehouse}</td>
                    <td className="num">{(loc.currentStock || 0).toLocaleString()}</td>
                    <td className="money">{currency(loc.stockValue)}</td>
                    <td>
                      <button
                        className={`pill status-${loc.status} pill-btn`}
                        onClick={() => handleToggleStatus(loc)}
                        title="Click to toggle status"
                      >
                        {loc.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
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
                <label className="field-label" htmlFor="locCode">Code</label>
                <input
                  type="text"
                  id="locCode"
                  readOnly
                  disabled
                  value={
                    editingId
                      ? form.code
                      : form.code || 'Select warehouse & type first'
                  }
                  style={{ background: '#f4f6fb', color: form.code ? '#1e2740' : '#9aa1b4', cursor: 'not-allowed' }}
                />
                {formErrors.code && <div className="field-error">{formErrors.code}</div>}
                <div style={{ fontSize: 11, color: '#9aa1b4', marginTop: 4 }}>
                  {editingId ? "Codes can't be changed after a location is created." : 'Auto-generated from warehouse and type.'}
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="locType">Type <span className="req">*</span></label>
                <select
                  id="locType"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {LOCATION_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {formErrors.type && <div className="field-error">{formErrors.type}</div>}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="locWarehouse">Warehouse <span className="req">*</span></label>
              <select
                id="locWarehouse"
                value={form.warehouseId}
                onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                disabled={!!editingId}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              {formErrors.warehouseId && <div className="field-error">{formErrors.warehouseId}</div>}
              {editingId && <div className="field-error" style={{ color: '#6b7280' }}>Locations can't be moved to a different warehouse.</div>}
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