import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

import apiClient from "../../../shared/api/axiosClient";

import Total from "../../../assets/icons/Total.svg?react";
import Dollar from "../../../assets/icons/Dollar.svg?react";
import File from "../../../assets/icons/File.svg?react";
import Transaction from "../../../assets/icons/transaction.svg?react";
import Trend from "../../../assets/icons/Trend.svg?react";
import Stock from "../../../assets/icons/stock.svg?react";
import Recent from "../../../assets/icons/tran.svg?react";
import Type from "../../../assets/icons/type.svg?react";

/* =======================================================
   TRANSACTION HELPERS
======================================================= */

async function fetchAllTransactions(params = {}) {
  let page = 1;
  let all = [];

  while (page <= 20) {
    const res = await apiClient.get("/transactions", {
      params: {
        ...params,
        page,
      },
    });

    const chunk = res.data?.data || [];
    all = all.concat(chunk);

    const meta = res.data?.meta;

    if (!meta || page >= meta.last_page) {
      break;
    }

    page += 1;
  }

  return all;
}

const TYPE_FAMILY = {
  receipt: "Receipt",
  transfer_in: "Transfer",
  transfer_out: "Transfer",
  adjustment_in: "Adjustment",
  adjustment_out: "Adjustment",
  opening_balance: "Opening Balance",
  stock_count: "Stock Count",
};

const TYPE_COLORS = {
  Receipt: "#16A369",
  Transfer: "#4F6EF7",
  Adjustment: "#C27A0A",
  "Opening Balance": "#94A3B8",
  "Stock Count": "#8B5CF6",
};

const TYPE_ROUTES = {
  Receipt: "/receipts",
  Transfer: "/transfers",
  Adjustment: "/adjustments",
  "Stock Count": "/stock-counts",
  "Opening Balance": "/transactions",
};

function baseType(rawType) {
  const key = String(rawType || "")
    .toLowerCase()
    .trim();

  if (TYPE_FAMILY[key]) {
    return TYPE_FAMILY[key];
  }

  return key
    ? key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Other";
}

function formatTransactionDate(transaction) {
  const raw =
    transaction.transaction_date ||
    transaction.created_at ||
    transaction.date;

  if (!raw) return "—";

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildDailyValueTrend(transactions) {
  const buckets = new Map();

  transactions.forEach((transaction) => {
    const rawDate =
      transaction.transaction_date ||
      transaction.created_at ||
      transaction.date;

    if (!rawDate) return;

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const quantity =
      Number(
        transaction.signed_quantity ??
        transaction.quantity ??
        transaction.qty ??
        0
      ) || 0;

    const unitCost =
      Number(
        transaction.unit_cost ??
        transaction.item?.unit_cost ??
        0
      ) || 0;

    const value = quantity * unitCost;

    buckets.set(
      key,
      (buckets.get(key) || 0) + value
    );
  });

  return Array.from(
    buckets.entries()
  ).map(([name, val]) => ({
    name,
    val: Math.round(val),
  }));
}

function buildTypeBreakdown(transactions) {
  const counts = new Map();

  transactions.forEach((transaction) => {
    const type = baseType(
      transaction.transaction_type ||
      transaction.type
    );

    counts.set(
      type,
      (counts.get(type) || 0) + 1
    );
  });

  return Array.from(
    counts.entries()
  ).map(([name, value]) => ({
    name,
    value,
    color:
      TYPE_COLORS[name] || "#94A3B8",
  }));
}

/* =======================================================
   UI HELPERS
======================================================= */

const StatCard = ({
  title,
  val,
  trend,
  icon,
  isDown,
}) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-[12px] font-bold text-[#6B7591] uppercase tracking-wider">
        {title}
      </p>

      <p className="text-[22px] font-extrabold text-[#1E2740] mt-2">
        {val}
      </p>

      <p
        className={`text-[11px] font-bold mt-2 ${isDown
          ? "text-orange-500"
          : "text-emerald-500"
          }`}
      >
        {trend}
      </p>
    </div>

    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 [&>svg]:w-5 [&>svg]:h-5">
      {icon}
    </div>
  </div>
);

const TableContainer = ({
  title,
  icon,
  onViewAll,
  children,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
      <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]">
        {icon}
        {title}
      </h3>

      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
        </button>
      )}
    </div>

    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

function transactionQuantity(transaction) {
  const qty = Number(
    transaction.signed_quantity ??
    transaction.quantity ??
    transaction.qty ??
    0
  );

  return Number.isFinite(qty)
    ? qty
    : 0;
}

/* =======================================================
   DASHBOARD
======================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [items, setItems] = useState([]);

  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    lowStockItems: [],
    totalTxns: 0,
    trend: [],
    byType: [],
    recentTransactions: [],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData =
      async () => {
        setLoading(true);

        try {
          const [
            itemsResponse,
            transactions,
          ] = await Promise.all([
            apiClient.get("/items", {
              params: {
                per_page: 100,
              },
            }),

            fetchAllTransactions({}),
          ]);

          if (cancelled) {
            return;
          }

          const allItems =
            itemsResponse.data?.data || [];

          let totalInventoryValue = 0;
          let lowStockCount = 0;

          const lowStockItems = [];

          allItems.forEach((item) => {
            const unitCost =
              Number(item.unit_cost) || 0;

            const currentStock =
              Number(item.total_stock) || 0;

            const reorderLevel =
              Number(
                item.reorder_level
              ) || 0;

            /*
             * LIVE inventory value:
             * current quantity × unit cost
             */
            totalInventoryValue +=
              currentStock * unitCost;

            /*
             * Low stock only when an item has
             * a reorder level configured and
             * its stock is at/below that level.
             */
            if (
              reorderLevel > 0 &&
              currentStock <= reorderLevel
            ) {
              lowStockCount += 1;

              lowStockItems.push({
                ...item,
                currentStock,
              });
            }
          });

          /*
           * Sort newest transactions first.
           */
          const sortedTransactions =
            [...transactions].sort(
              (a, b) => {
                const aDate =
                  new Date(
                    a.transaction_date ||
                    a.created_at ||
                    a.date ||
                    0
                  ).getTime();

                const bDate =
                  new Date(
                    b.transaction_date ||
                    b.created_at ||
                    b.date ||
                    0
                  ).getTime();

                return bDate - aDate;
              }
            );

          /*
           * Dashboard card remains "Completed Transactions".
           *
           * If your transactions endpoint contains only
           * posted/final inventory movements, transactions.length
           * is appropriate.
           *
           * If the API also returns draft/pending records,
           * replace this with a status filter later.
           */
          const completedTransactions =
            transactions;

          setItems(allItems);

          setStats({
            totalItems:
              itemsResponse.data?.meta
                ?.total ||
              allItems.length,

            totalValue:
              totalInventoryValue,

            lowStockCount,

            lowStockItems:
              lowStockItems.slice(0, 5),

            totalTxns:
              completedTransactions.length,

            trend:
              buildDailyValueTrend(
                completedTransactions
              ),

            byType:
              buildTypeBreakdown(
                completedTransactions
              ),

            recentTransactions:
              sortedTransactions.slice(
                0,
                5
              ),
          });
        } catch (error) {
          console.error(
            "Dashboard API Error:",
            error
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (
    loading &&
    items.length === 0
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2
          className="animate-spin text-blue-600"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 pb-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-[24px] font-extrabold text-[#1E2740] tracking-tight">
          Dashboard
        </h1>

        <p className="text-[#6B7591] text-[13px] font-medium mt-0.5">
          Live inventory overview
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Items"
          val={stats.totalItems.toLocaleString()}
          trend="Live"
          icon={<Total />}
        />

        <StatCard
          title="Inventory Value"
          val={`₦${stats.totalValue.toLocaleString()}`}
          trend="Live"
          icon={<Dollar />}
        />

        <StatCard
          title="Low Stock Items"
          val={stats.lowStockCount.toLocaleString()}
          trend="Review"
          icon={<File />}
          isDown
        />

        <StatCard
          title="Completed Transactions"
          val={stats.totalTxns.toLocaleString()}
          trend="All Time"
          icon={<Transaction />}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Inventory Value Trend */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px]">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]">
            <Trend />
            Inventory Value Trend
          </h3>

          <p className="text-[11px] text-gray-400 mt-1 mb-4">
            Value of stock received,
            transferred, or adjusted per
            transaction day.
          </p>

          {stats.trend.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-xs text-gray-400">
                No transaction value data
                available yet.
              </p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="78%"
            >
              <LineChart
                data={stats.trend}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke="#F1F5F9"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "#94A3B8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "#94A3B8",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₦${Number(
                      v
                    ).toLocaleString()}`
                  }
                />

                <Tooltip
                  formatter={(v) =>
                    `₦${Number(
                      v
                    ).toLocaleString()}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "#4F46E5",
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Transactions by Type */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px]">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 mb-4 text-[#1E2740]">
            <Type />
            Transactions by Type
          </h3>

          {stats.byType.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-xs text-gray-400">
                No transactions available
                yet.
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer
                width="100%"
                height="75%"
              >
                <PieChart>
                  <Pie
                    data={stats.byType}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    onClick={() => navigate("/transactions")}
                    style={{ cursor: "pointer" }}
                  >
                    {stats.byType.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {stats.byType.map(
                  (entry) => (
                    <button
                      type="button"
                      key={entry.name}
                      onClick={() =>
                        navigate(
                          TYPE_ROUTES[
                          entry.name
                          ] ||
                          "/transactions"
                        )
                      }
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7591] cursor-pointer hover:text-[#1E2740]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background:
                            entry.color,
                        }}
                      />

                      {entry.name} (
                      {entry.value})
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <TableContainer
        title="Recent Transactions"
        icon={<Recent />}
        onViewAll={() =>
          navigate("/transactions")
        }
      >
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#6B7591] font-bold border-b border-gray-50">
              <th className="px-6 py-4 text-left">
                ID
              </th>

              <th className="px-6 py-4 text-left">
                Date
              </th>

              <th className="px-6 py-4 text-left">
                Type
              </th>

              <th className="px-6 py-4 text-left">
                Item
              </th>

              <th className="px-6 py-4 text-left">
                From
              </th>

              <th className="px-6 py-4 text-left">
                To
              </th>

              <th className="px-6 py-4 text-center">
                Qty
              </th>

              <th className="px-6 py-4 text-left">
                User
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-[12px] font-semibold">
            {stats.recentTransactions
              .length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No recent transactions
                  available.
                </td>
              </tr>
            ) : (
              stats.recentTransactions.map(
                (transaction) => {
                  const type = baseType(
                    transaction.transaction_type ||
                    transaction.type
                  );

                  const quantity =
                    transactionQuantity(
                      transaction
                    );

                  return (
                    <tr
                      key={
                        transaction.id
                      }
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {transaction.transaction_number ||
                          transaction.reference ||
                          `TXN-${String(
                            transaction.id
                          ).padStart(
                            6,
                            "0"
                          )}`}
                      </td>

                      <td className="px-6 py-4 text-[#6B7591]">
                        {formatTransactionDate(
                          transaction
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-[10px] font-bold ${type ===
                            "Receipt"
                            ? "bg-emerald-50 text-emerald-600"
                            : type ===
                              "Transfer"
                              ? "bg-blue-50 text-blue-600"
                              : type ===
                                "Adjustment"
                                ? "bg-amber-50 text-amber-600"
                                : type ===
                                  "Stock Count"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#1E2740]">
                        {transaction.item
                          ?.name ||
                          transaction.item_name ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-[#6B7591]">
                        {transaction
                          .from_location
                          ?.name ||
                          transaction
                            .source_location
                            ?.name ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-[#6B7591]">
                        {transaction
                          .to_location
                          ?.name ||
                          transaction
                            .destination_location
                            ?.name ||
                          transaction
                            .location?.name ||
                          "—"}
                      </td>

                      <td
                        className={`px-6 py-4 text-center font-bold ${quantity < 0
                          ? "text-red-500"
                          : quantity > 0
                            ? "text-emerald-600"
                            : "text-[#1E2740]"
                          }`}
                      >
                        {quantity > 0 ? "+" : ""}
                        {quantity}
                      </td>

                      <td className="px-6 py-4 text-[#6B7591]">
                        {transaction.user
                          ?.name ||
                          transaction
                            .created_by_user
                            ?.name ||
                          transaction
                            .creator?.name ||
                          "—"}
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </TableContainer>

      {/* LOW STOCK ITEMS */}
      <TableContainer
        title="Low Stock Items"
        icon={<Stock />}
        onViewAll={() =>
          navigate("/items")
        }
      >
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#6B7591] font-bold border-b border-gray-50">
              <th className="px-6 py-4 text-left">
                Item
              </th>

              <th className="px-6 py-4 text-left">
                SKU
              </th>

              <th className="px-6 py-4 text-left">
                Category
              </th>

              <th className="px-6 py-4 text-center">
                Current Stock
              </th>

              <th className="px-6 py-4 text-center">
                Min. Stock
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-[12px] font-bold">
            {stats.lowStockItems
              .length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No low stock items.
                </td>
              </tr>
            ) : (
              stats.lowStockItems.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-[#1E2740]">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-[#94A3B8]">
                      {item.sku}
                    </td>

                    <td className="px-6 py-4 text-[#6B7591]">
                      {item.category
                        ?.name ||
                        "General"}
                    </td>

                    <td className="px-6 py-4 text-center text-[#1E2740]">
                      {Number(
                        item.currentStock ||
                        0
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {Number(
                        item.reorder_level ||
                        0
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600">
                        {Number(
                          item.currentStock ||
                          0
                        ) <= 0
                          ? "Out of Stock"
                          : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
};

export default Dashboard;