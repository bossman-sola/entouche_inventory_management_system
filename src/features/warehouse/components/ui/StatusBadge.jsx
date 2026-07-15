export const StatusBadge = ({ status }) => {
  const s = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s[status] || "bg-gray-100 text-gray-600"}`}>
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
};
