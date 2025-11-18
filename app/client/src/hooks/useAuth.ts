import { useState, useEffect, useCallback } from 'react'
import { authService, type AuthUser, type SignUpCredentials, type SignInCredentials } from '../services/auth'
import { logActivity } from '../services/activity'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Single auth state listener - no duplicate calls
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
        
        // Log login activity when user signs in
        if (user) {
          logActivity('login', { 
            email: user.email,
            role: user.role || 'tenant',
            login_time: new Date().toISOString()
          })
        }
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true)
    try {
      await authService.signUp(credentials)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true)
    try {
      await authService.signIn(credentials)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}