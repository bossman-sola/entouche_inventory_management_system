import { NotConnectedPanel } from './ui/NotConnectedPanel.jsx';

export function RecentMovementsCard() {
  return (
    <NotConnectedPanel
      className="min-h-[220px]"
      title="Recent Location Movements"
      description="Transfers and Receipts endpoints exist in the API but aren't wired into this view yet."
    />
  );
}
