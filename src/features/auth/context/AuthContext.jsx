import { createContext, useEffect, useState } from "react"
import { tokenStorage } from "../../../shared/api/axiosClient.js"
import * as authApi from "../api/authApi.js"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "checking" while we verify an existing token on first load, so routes
  // don't flash the login screen before we know the user is signed in.
  const [status, setStatus] = useState("checking") // "checking" | "authenticated" | "unauthenticated"
  const [error, setError] = useState(null)

  // On first load, if a token is already stored, verify it still works.
  useEffect(() => {
    const existingToken = tokenStorage.get()
    if (!existingToken) {
      setStatus("unauthenticated")
      return
    }

    authApi
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus("authenticated")
      })
      .catch(() => {
        tokenStorage.clear()
        setStatus("unauthenticated")
      })
  }, [])

  async function login({ email, password }) {
    setError(null)
    try {
      const { user: loggedInUser, access_token } = await authApi.login({ email, password })
      tokenStorage.set(access_token)
      setUser(loggedInUser)
      setStatus("authenticated")
      return loggedInUser
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "We couldn't sign you in. Check your email and password and try again."
      setError(message)
      throw err
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // even if the server call fails, clear local state so the user can leave
    } finally {
      tokenStorage.clear()
      setUser(null)
      setStatus("unauthenticated")
    }
  }

  const value = {
    user,
    status, // "checking" | "authenticated" | "unauthenticated"
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}