import { useState } from 'react'
import { SA_PROVINCES, USER_ROLES, CONDITION_STATES, DEFAULT_INSPECTION_CATEGORIES } from '../types'
import { formatAddress, formatGPSCoordinates, formatUserRole } from '../utils'
import type { PropertyAddress, GPSCoordinates, UserRole } from '../types'

export default function Phase2Demo() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant')
  
  const sampleAddress: PropertyAddress = {
    street_number: '123',
    street_name: 'Main Street',
    suburb: 'Rosebank',
    city: 'Johannesburg',
    province: 'Gauteng',
    postal_code: '2196'
  }
  
  const sampleGPS: GPSCoordinates = {
    latitude: -26.1448,
    longitude: 28.0436,
    accuracy: 8,
    timestamp: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-3" style={{maxWidth: '1024px'}}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CYAss PWA</h1>
          <p className="text-lg text-gray-600">Phase 2 Complete: Core Models & Services</p>
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
            ✅ TypeScript Foundation Ready
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Roles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">User Roles</h3>
            <div className="space-y-2">
              {USER_ROLES.map((role: { value: UserRole; label: string }) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedRole === role.value
                      ? 'bg-blue-100 text-blue-800 border-blue-300 border'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <strong>Selected:</strong> {formatUserRole(selectedRole)}
            </div>
          </div>

          {/* Condition States */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Condition States</h3>
            <div className="space-y-2">
              {CONDITION_STATES.map((condition: { value: string; label: string; color: string }) => (
                <div
                  key={condition.value}
                  className="flex items-center justify-between p-3 rounded"
                  style={{ backgroundColor: condition.color + '20', borderLeft: `4px solid ${condition.color}` }}
                >
                  <span className="font-medium">{condition.label}</span>
                  <span className="text-sm" style={{ color: condition.color }}>
                    {condition.color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Property Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Sample Property</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-1 text-gray-900">{formatAddress(sampleAddress)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
                <div className="mt-1 text-gray-900 font-mono text-sm">
                  {formatGPSCoordinates(sampleGPS)}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Real GPS capture will be implemented in Phase 4
              </div>
            </div>
          </div>

          {/* South African Provinces */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">SA Provinces</h3>
            <div className="grid grid-cols-1 gap-1 text-sm">
              {SA_PROVINCES.map((province: string) => (
                <div key={province} className="py-1 text-gray-700">
                  {province}
                </div>
              ))}
            </div>
          </div>

          {/* Room Templates Preview */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Inspection Categories by Room Type</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(DEFAULT_INSPECTION_CATEGORIES).slice(0, 3).map(([roomType, categories]) => (
                <div key={roomType}>
                  <h4 className="font-medium text-gray-900 mb-2">{roomType}</h4>
                  <div className="space-y-1">
                    {categories.slice(0, 4).map((category) => (
                      <div key={category.id} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {category.name}
                      </div>
                    ))}
                    {categories.length > 4 && (
                      <div className="text-xs text-gray-400">
                        +{categories.length - 4} more items
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's Available */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Phase 2 Implementation Complete</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ Services Built:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Authentication (auth.ts)</li>
                <li>• Property management (properties.ts)</li>
                <li>• Report management (reports.ts)</li>
                <li>• Photo/PDF storage (storage.ts)</li>
                <li>• Database client (supabase.ts)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ React Hooks Built:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• useAuth - Authentication state</li>
                <li>• useGeolocation - GPS capture</li>
                <li>• usePhoto - Photo management</li>
                <li>• useReport - Report operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ Type Definitions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Property & Address types</li>
                <li>• Report & Inspection types</li>
                <li>• Database schema types</li>
                <li>• Common utility types</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ Utilities & Validation:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zod validation schemas</li>
                <li>• Address & GPS formatters</li>
                <li>• Business rule validators</li>
                <li>• Helper functions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Next Phase:</strong> Authentication & Routing - This will add login pages, user management, 
              and navigation that you can interact with. The foundation is ready!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}