import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, Download, Upload, Search, ChevronDown, Filter, 
  MoreVertical, Eye, Trash2, SlidersHorizontal
} from 'lucide-react';
import ItemDetailsModal from '../components/ItemDetailsModal';
import AddNewItems from '../components/addNewItems';
import ImportItems from '../components/importItems';
import Num from "../../../assets/icons/num.svg?react";
import Card from "../../../assets/icons/card.svg?react";
import Burger from "../../../assets/icons/burger.svg?react";
import Book from "../../../assets/icons/Book.svg?react";
import Fiter from "../../../assets/icons/filter.svg?react";

const INITIAL_ITEMS = [
  { id: 1, name: 'Dell Latitude 5440', sku: 'LAP-001', barcode: '1234567890123', category: 'Laptops', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Active', stock: 35, stockStatus: 'In Stock', img: '💻', brand: 'Dell', model: 'Latitude 5440', weight: '1.48 kg', addedOn: 'May 20, 2025' },
  { id: 2, name: 'HP LaserJet Pro MFP M428', sku: 'PRN-001', barcode: '2345678901234', category: 'Printers', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Active', stock: 12, stockStatus: 'In Stock', img: '🖨️', brand: 'HP', model: 'M428fdw', weight: '12.6 kg', addedOn: 'May 18, 2025' },
  { id: 3, name: 'Ergonomic Office Chair', sku: 'CHR-002', barcode: '3456789012345', category: 'Furniture', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Active', stock: 8, stockStatus: 'In Stock', img: '🪑', brand: '', model: '', weight: '', addedOn: 'May 15, 2025' },
  { id: 4, name: 'Cat6 Ethernet Cable 2M', sku: 'CAB-002', barcode: '4567890123456', category: 'Accessories', uom: 'Meter (M)', type: 'Stock Item', status: 'Active', stock: 150, stockStatus: 'In Stock', img: '🔌', brand: '', model: '', weight: '', addedOn: 'May 10, 2025' },
  { id: 5, name: 'USB-C Hub 7-in-1', sku: 'ACC-003', barcode: '5678901234567', category: 'Accessories', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Active', stock: 25, stockStatus: 'In Stock', img: '🔗', brand: '', model: '', weight: '', addedOn: 'May 8, 2025' },
  { id: 6, name: '24" LED Monitor', sku: 'MON-001', barcode: '6789012345678', category: 'Monitors', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Active', stock: 18, stockStatus: 'In Stock', img: '🖥️', brand: '', model: '', weight: '', addedOn: 'May 5, 2025' },
  { id: 7, name: 'HP 58A Toner Cartridge', sku: 'CON-001', barcode: '7890123456789', category: 'Consumables', uom: 'Piece (PCS)', type: 'Consumable', status: 'Active', stock: 6, stockStatus: 'In Stock', img: '🖨️', brand: 'HP', model: '58A', weight: '', addedOn: 'May 3, 2025' },
  { id: 8, name: 'Wireless Keyboard', sku: 'ACC-004', barcode: '8901234567890', category: 'Accessories', uom: 'Piece (PCS)', type: 'Stock Item', status: 'Inactive', stock: 0, stockStatus: 'Out of Stock', img: '⌨️', brand: '', model: '', weight: '', addedOn: 'Apr 28, 2025' },
];

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const Items = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterType, setFilterType] = useState('All Types');

  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  
  const categories = ['All Categories', ...Array.from(new Set(items.map(i => i.category))).sort()];
  const statuses = ['All Statuses', 'Active', 'Inactive'];
  const types = ['All Types', 'Stock Item', 'Consumable'];

  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q);
      const matchesCategory = filterCategory === 'All Categories' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'All Statuses' || item.status === filterStatus;
      const matchesType = filterType === 'All Types' || item.type === filterType;
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [items, searchQuery, filterCategory, filterStatus, filterType]);

 
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSaveNewItem = (newItem) => {
    setItems(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
  };

  const handleDuplicateItem = (newItem) => {
    setItems(prev => [newItem, ...prev]);
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory_Items");
    XLSX.writeFile(wb, "Inventory_Export.xlsx");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(i => i.id !== id));
      setActiveMenu(null);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const hasActiveFilters =
    searchQuery || filterCategory !== 'All Categories' ||
    filterStatus !== 'All Statuses' || filterType !== 'All Types';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All Categories');
    setFilterStatus('All Statuses');
    setFilterType('All Types');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-w-0 font-['Inter'] pb-10">

      {/* PAGE HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#1E2740] tracking-tight">Items</h1>
          <p className="text-[#6B7591] text-[14px] font-medium mt-1">Manage all items in your inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <HeaderButton icon={<Upload size={16}/>} label="Import Items" onClick={() => setIsImportModalOpen(true)} />
          <ImportItems isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportComplete={() => {}} />
          <HeaderButton icon={<Download size={16}/>} label="Export Items" onClick={handleExport} />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18}/> Add New Item
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Items" val={items.length.toLocaleString()} sub="Active items" icon={<Num size={20}/>} />
        <StatCard title="Item Categories" val={Array.from(new Set(items.map(i => i.category))).length.toString()} sub="Categories" icon={<Card size={20}/>} />
        <StatCard title="Total SKUs" val={items.length.toLocaleString()} sub="Unique SKUs" icon={<Burger size={20}/>} />
        <StatCard title="Items with Barcode" val={items.filter(i => i.barcode).length.toLocaleString()} sub={`${Math.round((items.filter(i => i.barcode).length / items.length) * 100)}% of total items`} icon={<Book size={20}/>} />
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#F1F5F9] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search items by name, SKU, or barcode..."
              className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-semibold text-[#1E2740] outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-100 hidden sm:block"/>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#6B7591] whitespace-nowrap">Category</span>
            <FilterSelect
              value={filterCategory}
              onChange={handleFilterChange(setFilterCategory)}
              options={categories}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#6B7591] whitespace-nowrap">Status</span>
            <FilterSelect
              value={filterStatus}
              onChange={handleFilterChange(setFilterStatus)}
              options={statuses}
            />
          </div>

          {/* Item Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#6B7591] whitespace-nowrap">Item Type</span>
            <FilterSelect
              value={filterType}
              onChange={handleFilterChange(setFilterType)}
              options={types}
            />
          </div>

          {/* More Filters / Clear */}
          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[12px] font-bold text-indigo-500 hover:text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-all"
              >
                Clear
              </button>
            )}
            <button className="flex items-center gap-2 text-[#6B7591] border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-all">
              <Fiter size={15}/> More Filters
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
            {searchQuery && (
              <FilterPill label={`Search: "${searchQuery}"`} onRemove={() => { setSearchQuery(''); setCurrentPage(1); }}/>
            )}
            {filterCategory !== 'All Categories' && (
              <FilterPill label={filterCategory} onRemove={() => handleFilterChange(setFilterCategory)('All Categories')}/>
            )}
            {filterStatus !== 'All Statuses' && (
              <FilterPill label={filterStatus} onRemove={() => handleFilterChange(setFilterStatus)('All Statuses')}/>
            )}
            {filterType !== 'All Types' && (
              <FilterPill label={filterType} onRemove={() => handleFilterChange(setFilterType)('All Types')}/>
            )}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <tr className="text-[11px] uppercase font-extrabold text-[#6B7591] tracking-[0.1em]">
                <th className="px-6 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600"/></th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit of Measure</th>
                <th className="px-6 py-4">Item Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 w-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px] font-bold text-[#1E2740]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-[#6B7591] font-semibold text-[13px]">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-200"/>
                      <p>No items match your filters.</p>
                      <button onClick={clearFilters} className="text-indigo-500 font-bold text-[12px] hover:underline">Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600"/></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F1F5F9] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                          {typeof item.img === 'string' && (item.img.startsWith('blob:') || item.img.startsWith('http')) ? (
                            <img src={item.img} alt={item.name} className="w-full h-full object-cover"/>
                          ) : (
                            <span className="text-lg">{item.img || '📦'}</span>
                          )}
                        </div>
                        <span className="font-extrabold tracking-tight truncate max-w-[180px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6B7591] uppercase text-[12px]">{item.sku}</td>
                    <td className="px-6 py-4 text-[#6B7591] font-medium text-[12px]">{item.barcode}</td>
                    <td className="px-6 py-4 text-[#6B7591] font-medium">{item.category}</td>
                    <td className="px-6 py-4 text-[#6B7591] font-medium">{item.uom}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-tight ${item.type === 'Consumable' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-tight ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-extrabold">{item.stock}</span>
                        <span className={`text-[10px] font-bold ${item.stock <= 0 ? 'text-red-500' : item.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {item.stock <= 0 ? 'Out of Stock' : item.stockStatus || 'In Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 relative text-center">
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                      >
                        <MoreVertical size={18}/>
                      </button>
                      {activeMenu === item.id && (
                        <div className="absolute right-12 top-2 w-36 bg-white border border-[#F1F5F9] shadow-2xl rounded-xl z-50 py-1 overflow-hidden">
                          <button onClick={() => handleOpenModal(item)} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                            <Eye size={15} className="text-indigo-500"/> View Details
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                            <Trash2 size={15}/> Delete Item
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] font-semibold text-[#6B7591]">
            Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length.toLocaleString()} items
          </p>

          <div className="flex items-center gap-2">
            {/* Prev */}
            <PaginationBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PaginationBtn>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-[12px] text-gray-400 font-bold">…</span>
              ) : (
                <PaginationBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</PaginationBtn>
              )
            )}

            {/* Next */}
            <PaginationBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>›</PaginationBtn>

            {/* Per page */}
            <div className="relative ml-2">
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="appearance-none bg-[#F8FAFC] border border-gray-100 rounded-xl py-2 pl-3 pr-8 text-[12px] font-bold text-[#1E2740] outline-none cursor-pointer"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ItemDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onUpdate={handleUpdateItem}
        onDuplicate={handleDuplicateItem}
      />
      <AddNewItems isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewItem}/>
    </div>
  );
};

const StatCard = ({ title, val, sub, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
    <div className="w-14 h-14 rounded-2xl  flex items-center justify-center flex-shrink-0 text-indigo-500">{icon}</div>
    <div className="overflow-hidden text-left">
      <p className="text-[10px] uppercase font-bold text-[#6B7591] tracking-widest mb-1">{title}</p>
      <h2 className="text-[22px] font-extrabold text-[#1E2740] mb-1">{val}</h2>
      <p className="text-[11px] font-bold text-indigo-500">{sub}</p>
    </div>
  </div>
);

const HeaderButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#1E2740] hover:bg-gray-50 transition-all active:scale-95">
    {icon} {label}
  </button>
);

const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-[#F8FAFC] border border-gray-100 rounded-xl py-2.5 pl-4 pr-9 text-[12px] font-bold text-[#1E2740] outline-none cursor-pointer focus:ring-1 focus:ring-indigo-400 transition-all"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
  </div>
);

const FilterPill = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-bold">
    {label}
    <button onClick={onRemove} className="hover:text-indigo-900 leading-none">×</button>
  </span>
);

const PaginationBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-bold transition-all
      ${active ? 'bg-[#4F46E5] text-white shadow-sm' : ''}
      ${!active && !disabled ? 'text-[#6B7591] hover:bg-gray-100' : ''}
      ${disabled ? 'text-gray-200 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

export default Items;