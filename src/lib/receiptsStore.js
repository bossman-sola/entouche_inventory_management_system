

const STORAGE_KEY = 'entouche_receipts_v1';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota errors */
  }
}

export async function listReceipts() {
  return readAll();
}

export async function getReceipt(id) {
  return readAll().find((r) => r.id === id) || null;
}

export async function createReceipt(receipt) {
  const all = readAll();
  all.unshift(receipt);
  writeAll(all);
  return receipt;
}

export async function updateReceipt(id, patch) {
  const all = readAll();
  const next = all.map((r) => (r.id === id ? { ...r, ...patch } : r));
  writeAll(next);
  return next.find((r) => r.id === id) || null;
}

export async function deleteReceipt(id) {
  writeAll(readAll().filter((r) => r.id !== id));
}