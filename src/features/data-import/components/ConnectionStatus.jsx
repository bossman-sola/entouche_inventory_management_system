import { useState } from "react";
import { Icon, icons } from "../../../lib/icons";
import { DEFAULT_EMAIL, DEFAULT_PASSWORD } from "../../../lib/useInventoryApi";

export function ConnectionStatus({ authStatus, authError, currentUser, refLoading, onRetry }) {
  const isLoading = authStatus === "connecting" || refLoading;

  return (
    <div className="mb-6">
      {isLoading && (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          {/* header row */}
          <div className="flex gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          {/* body rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/5" />
              <div className="h-3 bg-gray-100 rounded w-1/6" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && authStatus === "error" && (
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