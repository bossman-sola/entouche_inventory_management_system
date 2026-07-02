import { useCallback, useEffect, useState } from "react"
import * as usersApi from "../api/usersApi.js"

export function useUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await usersApi.listUsers({ page, per_page: 100 })
      setUsers(response.data)
      setMeta(response.meta)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  return { users, meta, isLoading, error, refetch: fetchUsers }
}