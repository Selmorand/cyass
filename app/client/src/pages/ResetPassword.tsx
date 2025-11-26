import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { whitelabelConfig } from '../config/whitelabel'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has valid reset token
    const checkSession = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (!user) {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authService.updatePassword(password)
      // Redirect to login with success message
      navigate('/login', {
        state: { message: 'Password updated successfully! Please sign in with your new password.' }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
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
          Set new password
        </h2>
        <p className="mt-2 text-center small text-muted">
          Enter your new password below
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
                <label htmlFor="password" className="form-label small fw-medium">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter new password"
                  minLength={6}
                />
                <div className="form-text small">
                  Must be at least 6 characters
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label small fw-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              <div className="mb-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
