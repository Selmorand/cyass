import { useState, useEffect } from 'react'
import { testConnection } from '../services/supabase'

interface ConnectionStatus {
  success: boolean
  message: string
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testConnection()
      setStatus(result)
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to test connection'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-test connection on component mount
    handleTestConnection()
  }, [])

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        CY ASSETS - Database Connection Test
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                     text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Testing Connection...' : 'Test Connection'}
        </button>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.success 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <div className="font-semibold">
              {status.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className="text-sm mt-1">
              {status.message}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mt-4">
          <strong>Next steps:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Set up your database project</li>
            <li>Update your .env.local file with real database credentials</li>
            <li>Create database tables for CY ASSETS data models</li>
          </ol>
        </div>
      </div>
    </div>
  )
}