import { useState } from "react";
import { Icon, icons } from "../../../lib/icons";
import { DEFAULT_EMAIL, DEFAULT_PASSWORD } from "../../../lib/useInventoryApi";

export function ConnectionStatus({ authStatus, authError, currentUser, refLoading, onRetry }) {
  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      {authStatus === "connecting" && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" /></svg>
          Connecting to API…
        </span>
      )}
      {authStatus === "error" && (
        <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-wrap">
          <Icon d={icons.alert} size={13} /> {authError || "Could not connect to the API."}
          <button onClick={onRetry} className="ml-1 underline">Retry</button>
        </div>
      )}
    </div>
  );
}

export function LoginForm({ onLogin }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-sm">
      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon d={icons.lock} size={15} /> Sign in to the API</p>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full mb-2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full mb-3 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      <button onClick={() => onLogin(email, password)} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Connect</button>
    </div>
  );
}