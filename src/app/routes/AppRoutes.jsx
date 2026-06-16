import { Routes, Route } from "react-router-dom"
import MainLayout from "../../shared/layouts/MainLayout.jsx"

import ItemsPage from "../../features/items/pages/ItemsPage.jsx"

function AppRoutes() {
  return (
    <Routes>

     
      <Route path="/" element={<MainLayout />}>

        
        <Route index element={<div>Dashboard Home</div>} />

        <Route path="items" element={<ItemsPage />} />

        <Route path="users" element={<div>Users Page</div>} />

      </Route>

    </Routes>
  )
}

export default AppRoutes