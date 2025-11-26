import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/auth'
import { whitelabelConfig } from '../config/whitelabel'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-3 px-3">
        <div className="mx-auto w-100" style={{maxWidth: '400px'}}>
          <div className="text-center mb-4">
            <img src="/assets/logo.png" alt="CYAss" style={{height: '133px'}} className="mb-3" />
            <p className="mt-2 text-muted">{whitelabelConfig.appTagline}</p>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center">
                <div className="text-success mb-3">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>
                <h3 className="h5 fw-bold mb-3">Check your email</h3>
                <p className="text-muted mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-muted small mb-4">
                  Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                </p>
                <Link to="/login" className="btn btn-primary w-100">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-3 px-3">
      <div className="mx-auto w-100" style={{maxWidth: '400px'}}>
        <div className="text-center mb-4">
          <img src="/assets/logo.png" alt="CYAss" style={{height: '133px'}} className="mb-3" />
          <p className="mt-2 text-muted">{whitelabelConfig.appTagline}</p>
        </div>
        <h2 className="mt-3 text-center h4 fw-bold text-dark">
          Reset your password
        </h2>
        <p className="mt-2 text-center small text-muted">
          Enter your email address and we'll send you a link to reset your password.
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
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-muted text-decoration-none small"
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
