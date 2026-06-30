import { useState } from "react";

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  users: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  userGroup: ["M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"],
  userOff: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z", "M23 18.5L20.5 21 18 18.5M18 21l2.5-2.5"],
  search: "M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z",
  plus: "M12 4v16m8-8H4",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M19 9l-7 7-7-7",
  chevronLeft: "M15 18l-6-6 6-6",
  x: "M6 18L18 6M6 6l12 12",
  check: "M5 13l4 4L19 7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  adminIcon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  warehouseIcon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  inventoryIcon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  viewerIcon: "M13 10V3L4 14h7v7l9-11h-7z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
};

const ROLES_DATA = [
  {
    id: 1, name: "System Administrator", icon: icons.adminIcon, color: "text-blue-600", bg: "bg-blue-50",
    users: 1, permissions: ["Manage users", "Manage permissions", "System settings", "View all reports"],
  },
  {
    id: 2, name: "Warehouse Manager", icon: icons.warehouseIcon, color: "text-green-600", bg: "bg-green-50",
    users: 2, permissions: ["Oversee warehouse operations", "Approve inventory adjustments", "Approve transfers", "Monitor stock levels"],
  },
  {
    id: 3, name: "Inventory Officer", icon: icons.inventoryIcon, color: "text-teal-600", bg: "bg-teal-50",
    users: 3, permissions: ["Receive inventory", "Update stock quantities", "Move inventory", "Conduct stock counts"],
  },
  {
    id: 4, name: "Management Viewer", icon: icons.viewerIcon, color: "text-orange-500", bg: "bg-orange-50",
    users: 3, permissions: ["View dashboards", "View reports", "Audit inventory activity", "Read-only access"],
  },
];

const ROLE_COLORS = {
  "System Administrator": "text-blue-600",
  "Warehouse Manager": "text-green-600",
  "Inventory Officer": "text-teal-500",
  "Management Viewer": "text-orange-500",
};

const INITIAL_USERS = [
  { id: 1, initials: "AM", bg: "bg-blue-600", name: "Ayomide Ajayi", isYou: true, email: "ayomide.ajayi@inventorypro.com", role: "System Administrator", status: "Active", lastLogin: "May 27, 2025 09:32 AM" },
  { id: 2, initials: "IO", bg: "bg-green-600", name: "Ibrahim Okafor", isYou: false, email: "ibrahim.okafor@inventorypro.com", role: "Warehouse Manager", status: "Active", lastLogin: "May 27, 2025 08:15 AM" },
  { id: 3, initials: "CS", bg: "bg-orange-500", name: "Chinedu Samuel", isYou: false, email: "chinedu.samuel@inventorypro.com", role: "Inventory Officer", status: "Active", lastLogin: "May 26, 2025 04:45 PM" },
  { id: 4, initials: "EO", bg: "bg-teal-500", name: "Esther Obi", isYou: false, email: "esther.obi@inventorypro.com", role: "Inventory Officer", status: "Active", lastLogin: "May 26, 2025 02:10 PM" },
  { id: 5, initials: "BW", bg: "bg-purple-600", name: "Bola David", isYou: false, email: "bola.david@inventorypro.com", role: "Warehouse Manager", status: "Active", lastLogin: "May 26, 2025 11:05 AM" },
  { id: 6, initials: "MV", bg: "bg-pink-500", name: "Uche Kalu", isYou: false, email: "uche.kalu@inventorypro.com", role: "Management Viewer", status: "Active", lastLogin: "May 24, 2025 03:20 PM" },
  { id: 7, initials: "MV", bg: "bg-indigo-500", name: "Aisha Ahmed", isYou: false, email: "aisha.ahmed@inventorypro.com", role: "Management Viewer", status: "Active", lastLogin: "May 24, 2025 09:15 AM" },
  { id: 8, initials: "IO", bg: "bg-red-500", name: "Michael Omotosho", isYou: false, email: "michael.omotosho@inventorypro.com", role: "Inventory Officer", status: "Inactive", lastLogin: "May 22, 2025 05:40 PM" },
  { id: 9, initials: "TK", bg: "bg-yellow-500", name: "Taiwo Kunle", isYou: false, email: "taiwo.kunle@inventorypro.com", role: "Inventory Officer", status: "Active", lastLogin: "May 21, 2025 10:00 AM" },
  { id: 10, initials: "NK", bg: "bg-cyan-600", name: "Ngozi Kamara", isYou: false, email: "ngozi.kamara@inventorypro.com", role: "Management Viewer", status: "Active", lastLogin: "May 20, 2025 02:30 PM" },
  { id: 11, initials: "AO", bg: "bg-lime-600", name: "Ade Okonkwo", isYou: false, email: "ade.okonkwo@inventorypro.com", role: "Warehouse Manager", status: "Inactive", lastLogin: "May 18, 2025 09:00 AM" },
  { id: 12, initials: "FB", bg: "bg-rose-500", name: "Funmi Babatunde", isYou: false, email: "funmi.babatunde@inventorypro.com", role: "Inventory Officer", status: "Active", lastLogin: "May 17, 2025 01:15 PM" },
  { id: 13, initials: "KA", bg: "bg-violet-600", name: "Kemi Adeyemi", isYou: false, email: "kemi.adeyemi@inventorypro.com", role: "System Administrator", status: "Active", lastLogin: "May 15, 2025 11:45 AM" },
  { id: 14, initials: "OI", bg: "bg-amber-600", name: "Obinna Ike", isYou: false, email: "obinna.ike@inventorypro.com", role: "Management Viewer", status: "Active", lastLogin: "May 14, 2025 03:00 PM" },
];

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <Icon d={icons.x} size={16} />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

const UserForm = ({ user, roles, onSave, onClose }) => {
  const [form, setForm] = useState(user || { name: "", email: "", role: roles[0]?.name || "", status: "Active" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isValid = form.name.trim() && form.email.trim() && form.role;
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter full name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
        <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="Enter email address" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
        <div className="relative">
          <select value={form.role} onChange={e => set("role", e.target.value)} className="appearance-none w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
            {roles.map(r => <option key={r.name}>{r.name}</option>)}
          </select>
          <Icon d={icons.chevronDown} size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <div className="flex gap-3">
          {["Active", "Inactive"].map(s => (
            <button key={s} onClick={() => set("status", s)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.status === s ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button disabled={!isValid} onClick={() => isValid && onSave(form)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
          {user ? "Save Changes" : "Add User"}
        </button>
      </div>
    </div>
  );
};

export default function UsersRolesPage() {
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [roles, setRoles] = useState(ROLES_DATA);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [addRoleModal, setAddRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", permissions: [] });
  const PER_PAGE = 8;

  const filtered = users.filter(u =>
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()))
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = users.filter(u => u.status === "Active").length;
  const inactiveCount = users.filter(u => u.status === "Inactive").length;

  const addUser = (form) => {
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["bg-blue-600", "bg-green-600", "bg-orange-500", "bg-teal-500", "bg-purple-600", "bg-pink-500", "bg-indigo-500"];
    setUsers(p => [...p, { id: Date.now(), initials, bg: colors[Math.floor(Math.random() * colors.length)], name: form.name, isYou: false, email: form.email, role: form.role, status: form.status, lastLogin: "Never" }]);
    setAddModal(false);
  };

  const saveEdit = (form) => {
    setUsers(p => p.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    setEditUser(null);
  };

  const confirmDelete = () => {
    setUsers(p => p.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  const toggleStatus = (id) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage system users and their access permissions</p>
        </div>
        <button onClick={() => setAddModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
          <Icon d={icons.plus} size={15} /> Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, link: "View all users →", icon: icons.users, bg: "bg-blue-50", color: "text-blue-500" },
          { label: "Active Users", value: activeCount, link: "View active users →", icon: icons.shield, bg: "bg-green-50", color: "text-green-500" },
          { label: "Roles", value: roles.length, link: "View all roles →", icon: icons.userGroup, bg: "bg-orange-50", color: "text-orange-500" },
          { label: "Inactive Users", value: inactiveCount, link: "View inactive users →", icon: icons.userOff, bg: "bg-purple-50", color: "text-purple-500" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon d={s.icon} size={18} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <button className="text-xs text-blue-500 font-medium hover:text-blue-700 mt-0.5 whitespace-nowrap">{s.link}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main panel */}
        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-5">
            {["Users", "Roles"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "Users" && (
            <>
              {/* Filters */}
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users by name, email or role..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="appearance-none w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">All Roles</option>
                      {roles.map(r => <option key={r.name}>{r.name}</option>)}
                    </select>
                    <Icon d={icons.chevronDown} size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">All Statuses</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                    <Icon d={icons.chevronDown} size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      {["User", "Email", "Role", "Status", "Last Login", "Actions"].map(h => (
                        <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${u.bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{u.initials}</div>
                            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{u.name}</span>
                            {u.isYou && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">You</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-medium whitespace-nowrap ${ROLE_COLORS[u.role] || "text-gray-600"}`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{u.status}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{u.lastLogin}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setEditUser(u)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                              <Icon d={icons.edit} size={14} />
                            </button>
                            <div className="relative">
                              <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                                <Icon d={icons.dotsV} size={15} fill="currentColor" stroke="none" />
                              </button>
                              {openMenu === u.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-44 py-1">
                                  <button onClick={() => { setEditUser(u); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Icon d={icons.edit} size={13} /> Edit User
                                  </button>
                                  <button onClick={() => { toggleStatus(u.id); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Icon d={icons.eye} size={13} /> {u.status === "Active" ? "Deactivate" : "Activate"}
                                  </button>
                                  {!u.isYou && (
                                    <button onClick={() => { setDeleteUser(u); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                                      <Icon d={icons.trash} size={13} /> Delete User
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500 text-center sm:text-left">Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users</p>
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                    <Icon d={icons.chevronLeft} size={13} />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                    <Icon d={icons.chevronRight} size={13} />
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "Roles" && (
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <p className="text-sm text-gray-500">{roles.length} roles defined in the system</p>
                <button onClick={() => setAddRoleModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                  <Icon d={icons.plus} size={13} /> Add Role
                </button>
              </div>
              <div className="space-y-3">
                {roles.map(r => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.bg}`}>
                          <Icon d={r.icon} size={18} className={r.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{r.name}</p>
                          <p className="text-xs text-gray-500">{r.users} user{r.users !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center shrink-0">
                        <button onClick={() => setEditRole(r)} className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Edit</button>
                        <Icon d={icons.chevronRight} size={16} className="text-gray-400 mt-0.5" />
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {r.permissions.map(p => (
                        <li key={p} className="text-xs text-gray-500 flex items-center gap-1.5 ml-13">
                          <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Roles Overview Sidebar */}
        <div className="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Roles Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">{roles.length} roles defined in the system</p>
          </div>
          <div className="p-3 space-y-2">
            {roles.map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.bg}`}>
                      <Icon d={r.icon} size={14} className={r.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.users} user{r.users !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Icon d={icons.chevronRight} size={13} className="text-gray-400 shrink-0" />
                </div>
                <ul className="space-y-0.5">
                  {r.permissions.map(p => (
                    <li key={p} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button onClick={() => setRoleModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Icon d={icons.settings} size={14} /> Manage Roles
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New User">
        <UserForm roles={roles} onSave={addUser} onClose={() => setAddModal(false)} />
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && <UserForm user={editUser} roles={roles} onSave={saveEdit} onClose={() => setEditUser(null)} />}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User">
        {deleteUser && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Are you sure you want to delete <strong>{deleteUser.name}</strong>?</p>
            <p className="text-sm text-red-500 mb-5">This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setDeleteUser(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors">Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manage Roles Modal */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Manage Roles">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {roles.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-xl flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.bg}`}>
                  <Icon d={r.icon} size={13} className={r.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.users} users</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditRole(r); setRoleModalOpen(false); }} className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Edit</button>
                <button onClick={() => setRoles(p => p.filter(x => x.id !== r.id))} className="px-2.5 py-1 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => { setRoleModalOpen(false); setAddRoleModal(true); }} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
            <Icon d={icons.plus} size={14} /> Add New Role
          </button>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal open={!!editRole} onClose={() => setEditRole(null)} title="Edit Role">
        {editRole && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input defaultValue={editRole.name} onChange={e => setEditRole(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-2">
                {editRole.permissions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
                    <span className="text-sm text-gray-700">{p}</span>
                    <button onClick={() => setEditRole(r => ({ ...r, permissions: r.permissions.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 shrink-0">
                      <Icon d={icons.x} size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={() => setEditRole(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setRoles(p => p.map(r => r.id === editRole.id ? editRole : r)); setEditRole(null); }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Role Modal */}
      <Modal open={addRoleModal} onClose={() => setAddRoleModal(false)} title="Add New Role">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name <span className="text-red-500">*</span></label>
            <input value={newRoleForm.name} onChange={e => setNewRoleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Stock Auditor" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => setAddRoleModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button disabled={!newRoleForm.name.trim()} onClick={() => {
              setRoles(p => [...p, { id: Date.now(), name: newRoleForm.name, icon: icons.adminIcon, color: "text-blue-600", bg: "bg-blue-50", users: 0, permissions: [] }]);
              setNewRoleForm({ name: "", permissions: [] });
              setAddRoleModal(false);
            }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold">Add Role</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}