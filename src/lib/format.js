export function apiErrorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

export const currency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);
