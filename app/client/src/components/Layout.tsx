import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Properties', href: '/properties', icon: '🏢' },
    { name: 'Reports', href: '/reports', icon: '📋' }
  ]

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-bottom">
        <div className="container-fluid px-3" style={{maxWidth: '1024px'}}>
          {/* Top row: Logo and Burger/Desktop Nav */}
          <div className="d-flex justify-content-between align-items-center" style={{height: '70px'}}>
            <Link to="/dashboard" className="d-flex align-items-center text-decoration-none">
              <img src="/assets/logo.png" alt="CYAss" style={{height: '60px'}} />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="d-none d-lg-flex align-items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link d-flex align-items-center px-3 py-2 text-decoration-none ${
                    isActiveRoute(item.href)
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Mobile Burger Button */}
            <button 
              className="btn d-lg-none p-2 border-0" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                backgroundColor: '#88cb11',
                borderRadius: '8px',
                minWidth: '40px',
                height: '40px'
              }}
            >
              <div className="d-flex flex-column justify-content-center align-items-center">
                <div style={{
                  width: '20px',
                  height: '3px',
                  backgroundColor: '#0c0e43',
                  margin: '2px 0',
                  borderRadius: '2px'
                }}></div>
                <div style={{
                  width: '20px',
                  height: '3px',
                  backgroundColor: '#0c0e43',
                  margin: '2px 0',
                  borderRadius: '2px'
                }}></div>
                <div style={{
                  width: '20px',
                  height: '3px',
                  backgroundColor: '#0c0e43',
                  margin: '2px 0',
                  borderRadius: '2px'
                }}></div>
              </div>
            </button>
          </div>
          
          {/* Second row: User info (desktop) */}
          <div className="d-none d-lg-flex justify-content-end align-items-center pb-2">
            {user && (
              <>
                <div className="small text-dark me-3">
                  <span className="fw-medium">{user.email}</span>
                  {user.role && (
                    <span className="ms-2 px-2 py-1 small rounded-pill" style={{backgroundColor: '#0c0e43', color: 'white'}}>
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-link text-muted p-2 text-decoration-none small"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="d-lg-none border-top">
            {/* Mobile Navigation Links */}
            <div className="py-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`d-block nav-link text-decoration-none px-3 py-2 ${
                    isActiveRoute(item.href)
                      ? 'bg-primary bg-opacity-10 text-primary border-start border-primary border-4'
                      : 'text-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="me-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Mobile User Info */}
            {user && (
              <div className="border-top px-3 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="small">
                    <div className="fw-medium text-dark">{user.email}</div>
                    {user.role && (
                      <span className="mt-1 px-2 py-1 small rounded-pill d-inline-block" style={{backgroundColor: '#0c0e43', color: 'white'}}>
                        {user.role}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-link text-muted p-2 text-decoration-none small"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-top">
        <div className="container-fluid px-3 py-4" style={{maxWidth: '1024px'}}>
          <div className="d-flex justify-content-between align-items-center">
            <p className="small text-muted mb-0">
              © 2024 CYAss - Cover Your Assets. Property condition reporting for South Africa.
            </p>
            <div className="d-flex gap-3 small text-muted">
              <a href="#" className="text-decoration-none text-muted">Privacy</a>
              <a href="#" className="text-decoration-none text-muted">Terms</a>
              <a href="#" className="text-decoration-none text-muted">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}