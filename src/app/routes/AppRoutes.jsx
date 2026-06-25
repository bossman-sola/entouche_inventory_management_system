import { Routes, Route } from "react-router-dom"
import MainLayout from "../../shared/layouts/MainLayout.jsx"
import Dashboard from '../../features/dashboard/pages/Dashboard.jsx'
import ItemsPage from "../../features/items/pages/ItemsPage.jsx"
import Receipts from "../../features/receipts/pages/Receipts.jsx"
import Transfer from "../../features/transfers/pages/TransferPage.jsx"
import Adjustments from "../../features/adjustments/pages/AdjustmentsPage.jsx"
import Transcations from "../../features/transactions/pages/TransactionsPage.jsx"
import OverView from "../../features/warehouse/pages/Overview.jsx"
import User from "../../features/users/pages/users.jsx"
import Data from "../../features/data-import/pages/data.jsx"
import Audit from "../../features/audit-logs/pages/audit.jsx"  
import Settings from "../../features/settings/pages/settings.jsx"
import Reports from "../../features/reports/pages/reports.jsx"

function AppRoutes() {
  return (
    <Routes>

     
      <Route path="/" element={<MainLayout />}>

        
        <Route index element={<Dashboard />} />

        <Route path="items" element={<ItemsPage />} />

        <Route path="users" element={<div>Users Page</div>} />

        <Route path="receipts" element={<Receipts />} />

        <Route path="transfers" element={<Transfer />} />

        <Route path="adjustments" element={<Adjustments />} />
        <Route path="transactions" element={<Transcations />} />
        <Route path="overview" element={<OverView />} />
        <Route path="user" element={<User />} />
        <Route path="audit" element={<Audit />} />
        <Route path="data" element={<Data />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />

      </Route>

    </Routes>
  )
}

export default AppRoutes