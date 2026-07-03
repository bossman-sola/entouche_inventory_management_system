import AppRoutes from "./routes/AppRoutes.jsx"
import { AuthProvider } from "../features/auth/context/AuthContext.jsx"

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App