import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../features/auth/hooks/useAuth.js"

function ProtectedRoute() {
  const { isAuthenticated, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) {
    // brief check on first load while we verify a stored token
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute