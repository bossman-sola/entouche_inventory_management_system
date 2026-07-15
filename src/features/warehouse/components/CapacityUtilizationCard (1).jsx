import { NotConnectedPanel } from './ui/NotConnectedPanel.jsx';

export function CapacityUtilizationCard() {
  return (
    <NotConnectedPanel
      title="Capacity Utilization by Location"
      description="Capacity data isn't exposed by the API yet — locations don't carry a capacity field to compute utilization from."
    />
  );
}
