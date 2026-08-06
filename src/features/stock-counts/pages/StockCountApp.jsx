import { useState } from "react";
import { StockCountsList } from "./StockCountsList.jsx";
import { StockCountDetails } from "./StockCountDetails.jsx";

export default function StockCountApp() {
  const [route, setRoute] = useState({ name: "list" });

  return (
    <div
      className="min-h-screen bg-gray-50 font-sans"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      {route.name === "list" ? (
        <StockCountsList
          onOpenDetails={(id) => setRoute({ name: "details", id })}
        />
      ) : (
        <StockCountDetails
          countId={route.id}
          onBack={() => setRoute({ name: "list" })}
          onOpenDetails={(id) => setRoute({ name: "details", id })}
        />
      )}
    </div>
  );
}
