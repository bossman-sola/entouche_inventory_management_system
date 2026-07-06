
export const generateCode = (name) => {
  const base = (name || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  return base || `CODE${Date.now().toString().slice(-6)}`;
};
