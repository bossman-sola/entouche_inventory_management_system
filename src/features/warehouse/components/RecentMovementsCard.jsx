import { useEffect, useState } from "react";
import apiClient from "../../../shared/api/axiosClient.js";

const MOVEMENT_TYPES = new Set([
  "transfer_in",
  "transfer_out",
  "receipt",
  "opening_balance",
]);

function formatType(type) {
  switch (type) {
    case "transfer_in":
      return "Transfer In";
    case "transfer_out":
      return "Transfer Out";
    case "receipt":
      return "Receipt";
    case "opening_balance":
      return "Opening Balance";
    default:
      return String(type || "Movement")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function formatQuantity(value) {
  const number = Number(value || 0);

  return Number.isInteger(number)
    ? number.toLocaleString()
    : number.toLocaleString(undefined, {
        maximumFractionDigits: 3,
      });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getMovementRoute(transaction) {
  const transfer = transaction?.transfer;

  if (
    transaction?.transaction_type === "transfer_in" ||
    transaction?.transaction_type === "transfer_out"
  ) {
    return {
      from:
        transfer?.from_location?.name ||
        transfer?.from_warehouse?.name ||
        "—",

      to:
        transfer?.to_location?.name ||
        transfer?.to_warehouse?.name ||
        transaction?.location?.name ||
        "—",
    };
  }

  if (
    transaction?.transaction_type === "receipt" ||
    transaction?.transaction_type === "opening_balance"
  ) {
    return {
      from: "External",
      to:
        transaction?.location?.name ||
        transaction?.warehouse?.name ||
        "—",
    };
  }

  return {
    from:
      transaction?.direction === "out"
        ? transaction?.location?.name ||
          transaction?.warehouse?.name ||
          "—"
        : "—",

    to:
      transaction?.direction === "in"
        ? transaction?.location?.name ||
          transaction?.warehouse?.name ||
          "—"
        : "—",
  };
}

export function RecentMovementsCard() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMovements() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get("/transactions", {
          params: {
            per_page: 20,
          },
        });

        const transactions = Array.isArray(data?.data)
          ? data.data
          : [];

        const recent = transactions
          .filter((transaction) =>
            MOVEMENT_TYPES.has(
              String(transaction.transaction_type || "").toLowerCase(),
            ),
          )
          .slice(0, 5);

        if (!cancelled) {
          setMovements(recent);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Couldn't load recent movements.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMovements();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Recent Location Movements
          </h3>

          <p className="text-xs text-gray-500 mt-0.5">
            Latest inventory movements between warehouse locations
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[220px]">
          <p className="text-sm text-gray-400">
            Loading recent movements…
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center justify-center min-h-[220px] px-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && movements.length === 0 && (
        <div className="flex items-center justify-center min-h-[220px] px-6 text-center">
          <div>
            <p className="text-sm font-medium text-gray-700">
              No recent movements
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Transfers and receipts will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Movements */}
      {!loading && !error && movements.length > 0 && (
        <div className="divide-y divide-gray-100">
          {movements.map((movement) => {
            const route = getMovementRoute(movement);

            const isOut =
              movement.direction === "out";

            return (
              <div
                key={movement.id}
                className="px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Type + transaction */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          isOut
                            ? "bg-orange-50 text-orange-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {formatType(
                          movement.transaction_type,
                        )}
                      </span>

                      <span className="text-xs text-gray-400">
                        {movement.transaction_number ||
                          `TXN-${String(
                            movement.id,
                          ).padStart(6, "0")}`}
                      </span>
                    </div>

                    {/* Item */}
                    <p className="mt-2 text-sm font-semibold text-gray-900 truncate">
                      {movement.item?.name || "Unknown item"}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {movement.item?.sku || "No SKU"}
                    </p>

                    {/* Route */}
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <span className="text-gray-500 truncate">
                        {route.from}
                      </span>

                      <span className="text-gray-300">→</span>

                      <span className="font-medium text-gray-700 truncate">
                        {route.to}
                      </span>
                    </div>
                  </div>

                  {/* Quantity / date */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isOut
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {isOut ? "−" : "+"}
                      {formatQuantity(movement.quantity)}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-1 whitespace-nowrap">
                      {formatDate(
                        movement.transaction_date ||
                          movement.created_at,
                      )}
                    </p>

                    {movement.performer?.name && (
                      <p className="text-[11px] text-gray-400 mt-1 max-w-[120px] truncate">
                        {movement.performer.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentMovementsCard;