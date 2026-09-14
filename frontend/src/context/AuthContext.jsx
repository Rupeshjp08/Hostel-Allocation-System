import { createContext, useCallback, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, registerStudent } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('hostel_token')
    if (!savedToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await getCurrentUser()
      // API returns { success: true, data: { user: ... } }
      setUser(response.data.data.user)
      setError(null)
    } catch (err) {
      console.error('Failed to authenticate session:', err)
      localStorage.removeItem('hostel_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = async (credentials) => {
    setError(null)
    try {
      const response = await loginUser(credentials)
      const { token: newToken, user: userData } = response.data.data
      localStorage.setItem('hostel_token', newToken)
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.'
      setError(msg)
      throw new Error(msg)
    }
  }

  const register = async (payload) => {
    setError(null)
    try {
      const response = await registerStudent(payload)
      const { token: newToken, user: userData } = response.data.data
      localStorage.setItem('hostel_token', newToken)
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.'
      setError(msg)
      throw new Error(msg)
    }
  }

  const logout = () => {
    localStorage.removeItem('hostel_token')
    setToken(null)
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        isAuthenticated: !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
