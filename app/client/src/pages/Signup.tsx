import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'
import { whitelabelConfig } from '../config/whitelabel'
import type { UserRole } from '../types'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('tenant')
  const [error, setError] = useState('')
  const { signUp, loading } = useAuth()
  const navigate = useNavigate()

  const roles = [
    { value: 'tenant' as UserRole, label: 'Tenant', description: 'Document property condition as a renter' },
    { value: 'landlord' as UserRole, label: 'Landlord', description: 'Create condition reports for rental properties' },
    { value: 'buyer' as UserRole, label: 'Buyer', description: 'Inspect property before purchase' },
    { value: 'seller' as UserRole, label: 'Seller', description: 'Document property condition for sale' },
    { value: 'agent' as UserRole, label: 'Agent', description: 'Create reports for clients' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      await signUp({ email, password, role })
      navigate('/login', { 
        state: { message: `Account created successfully! Please check your email (${email}) and click the verification link to activate your account before signing in.` }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle()
      // Supabase handles the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-5">
      <div className="mx-auto" style={{maxWidth: '28rem'}}>
        <div className="text-center">
          <h1 className="display-4 fw-bold text-primary">{whitelabelConfig.appName}</h1>
          <p className="mt-2 text-muted">{whitelabelConfig.appTagline}</p>
        </div>
        <h2 className="mt-4 text-center h2 fw-bold text-dark">
          Create your account
        </h2>
        <p className="mt-2 text-center small text-muted">
          Or{' '}
          <Link
            to="/login"
            className="fw-medium text-primary text-decoration-none"
          >
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-4 mx-auto" style={{maxWidth: '28rem'}}>
        <div className="bg-white py-4 px-4 shadow rounded p-sm-5">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Your Role
              </label>
              <div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="form-select"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} - {r.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="position-relative">
              <div className="position-absolute top-50 start-0 end-0 translate-middle-y">
                <div className="border-top" />
              </div>
              <div className="position-relative d-flex justify-content-center small">
                <span className="px-2 bg-white text-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn btn-outline-secondary w-100 d-flex justify-content-center align-items-center"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ms-2">Sign up with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}