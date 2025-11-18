import { createContext, useContext, type ReactNode } from 'react'
import { useAuth as useAuthHook } from '../hooks/useAuth'
import type { AuthUser, SignUpCredentials, SignInCredentials } from '../services/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}