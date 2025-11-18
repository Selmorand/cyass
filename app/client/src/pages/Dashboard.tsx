import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { formatUserRole } from '../utils'
import { getProperties } from '../services/properties'
import { getReports } from '../services/reports'
import type { Property, Report } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Load properties first (faster query)
        const propertiesData = await getProperties()
        setProperties(propertiesData)
        setLoading(false) // Show UI immediately after properties load
        
        // Load reports in background
        const reportsData = await getReports()
        setReports(reportsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])


  const quickActions = [
    {
      name: 'Add Property',
      description: `Register a new property for inspection${properties.length > 0 ? ` (${properties.length} existing)` : ''}`,
      href: '/properties/new',
      icon: '🏢',
      color: '#0c0e43'
    },
    {
      name: 'View Properties',
      description: `Browse your registered properties${properties.length > 0 ? ` (${properties.length} total)` : ' (none yet)'}`,
      href: '/properties',
      icon: '📍',
      color: '#88cb11'
    },
    {
      name: 'Start Report',
      description: properties.length > 0 ? 'Begin a new condition report' : 'Add a property first to start reporting',
      href: properties.length > 0 ? `/reports/new?property=${properties[0].id}` : '/properties/new',
      icon: '📋',
      color: '#0c0e43'
    },
    {
      name: 'View Reports',
      description: `Browse your completed reports${reports.length > 0 ? ` (${reports.length} total)` : ' (none yet)'}`,
      href: '/reports',
      icon: '📖',
      color: '#88cb11'
    }
  ]

  return (
    <div className="py-4">
      <div className="container-fluid px-3" style={{maxWidth: '1024px'}}>
        {/* Header */}
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div className="flex-fill">
            <h1 className="h2 fw-bold text-dark text-truncate">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="mt-1 small text-muted">
              {user?.role && `${formatUserRole(user.role)} Dashboard`} - Manage your property condition reports
            </p>
          </div>
          <div className="mt-3 d-flex gap-2 mt-md-0 ms-md-3">
            <Link
              to="/reports/new"
              className="btn btn-primary btn-sm"
            >
              📋 New Report
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-header">
                  <h3 className="h5 fw-medium text-dark mb-0">Quick Actions</h3>
                  <p className="small text-muted mt-1 mb-0">Get started with these common tasks</p>
                </div>
                <div className="card-body">
                  <div className="vstack gap-3">
                  {quickActions.map((action) => (
                    <a
                      key={action.name}
                      href={action.href}
                      className="text-decoration-none d-block p-3 border rounded border-2"
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded d-flex align-items-center justify-content-center text-white" style={{width: '2.5rem', height: '2.5rem', backgroundColor: action.color}}>
                            {action.icon}
                          </div>
                        </div>
                        <div className="ms-3">
                          <h6 className="fw-medium text-dark mb-1">{action.name}</h6>
                          <p className="small text-muted mb-0">{action.description}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}