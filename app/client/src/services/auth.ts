import { supabase } from './supabase'
import type { UserRole } from '../types'

export interface AuthUser {
  id: string
  email: string
  role?: UserRole
  created_at: string
}

export interface SignUpCredentials {
  email: string
  password: string
  role: UserRole
}

export interface SignInCredentials {
  email: string
  password: string
}

export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
        },
      },
    })
    
    if (error) throw error
    return data
  },

  async signUp({ email, password, role }: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    })

    if (error) throw error
    return data
  },

  async signIn({ email, password }: SignInCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role,
      created_at: user.created_at
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role,
          created_at: session.user.created_at
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}