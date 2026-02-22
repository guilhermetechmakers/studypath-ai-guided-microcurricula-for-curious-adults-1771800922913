import * as React from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token === 'guest') {
      setUserState({ id: 'guest', email: 'guest@studypath.app', name: 'Guest' })
    } else if (token) {
      setUserState({
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
      })
    }
    setIsLoading(false)
  }, [])

  const login = React.useCallback(async (email: string, _password: string) => {
    // Mock - in real app call API
    localStorage.setItem('auth_token', 'mock-token')
    setUserState({ id: '1', email, name: 'User' })
  }, [])

  const signup = React.useCallback(async (email: string, _password: string, name?: string) => {
    // Mock - in real app call API
    localStorage.setItem('auth_token', 'mock-token')
    setUserState({ id: '1', email, name })
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem('auth_token')
    setUserState(null)
  }, [])

  const loginAsGuest = React.useCallback(() => {
    localStorage.setItem('auth_token', 'guest')
    setUserState({ id: 'guest', email: 'guest@studypath.app', name: 'Guest' })
  }, [])

  const setUser = React.useCallback((u: User | null) => {
    setUserState(u)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    loginAsGuest,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
