

const rows = [];

function readAll() {
  return [...rows];
}

function writeAll(nextRows) {
  rows.length = 0;
  rows.push(...nextRows);
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