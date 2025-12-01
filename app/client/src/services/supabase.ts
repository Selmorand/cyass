import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use mock database for testing when credentials are not available
let supabase: any

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('Using mock database - configure .env for production')
  // Import mock dynamically
  const mockModule = await import('./mock-supabase')
  supabase = mockModule.supabase
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // CRITICAL: Use localStorage for session persistence in PWAs
      // This ensures sessions persist across page navigation and async operations
      storage: window.localStorage,
      storageKey: 'cyass-auth-token',
      // Auto-refresh tokens before expiry to prevent silent logouts
      autoRefreshToken: true,
      persistSession: true,
      // Detect session from URL after email confirmations, etc.
      detectSessionInUrl: true
    }
  })
}

export { supabase }

// Test connection function
export const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error
    }
    
    return { success: true, message: 'Connected to database successfully!' }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown connection error' 
    }
  }
}