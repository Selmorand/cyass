import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'
import { whitelabelConfig } from '../config/whitelabel'
import { useNotification } from '../contexts/NotificationContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showInfo } = useNotification()

  useEffect(() => {
    // Check if user came from signup with a verification message
    if (location.state?.message) {
      showInfo(location.state.message, 6000) // Show for 6 seconds
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true })
    }
  }, [location, showInfo, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-3 px-3">
      <div className="mx-auto w-100" style={{maxWidth: '400px'}}>
        <div className="text-center mb-4">
          <img src="/assets/logo.png" alt="CYAss" style={{height: '133px'}} className="mb-3" />
          <p className="mt-2 text-muted">{whitelabelConfig.appTagline}</p>
        </div>
        <h2 className="mt-3 text-center h4 fw-bold text-dark">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center small text-muted">
          Or{' '}
          <Link
            to="/signup"
            className="fw-medium text-primary text-decoration-none"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-3 mx-auto w-100" style={{maxWidth: '400px'}}>
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="form-label small fw-medium">
                  Email address
                </label>
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

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="password" className="form-label small fw-medium mb-0">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="small text-primary text-decoration-none"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-4">
              <div className="position-relative mb-3">
                <div className="position-absolute top-50 start-0 end-0 translate-middle-y">
                  <div className="border-top" />
                </div>
                <div className="position-relative d-flex justify-content-center small">
                  <span className="px-2 bg-white text-muted">Or continue with</span>
                </div>
              </div>

              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="btn btn-outline-secondary w-100 d-flex justify-content-center align-items-center py-2"
                >
                  <svg className="me-2" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}