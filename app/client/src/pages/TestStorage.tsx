import { useState } from 'react'
import { testStorageBuckets } from '../test-storage'

export default function TestStorage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const runTest = async () => {
    setTesting(true)
    setLogs([])
    setResults(null)
    
    // Capture console logs
    const originalLog = console.log
    const originalError = console.error
    const capturedLogs: string[] = []
    
    console.log = (...args) => {
      capturedLogs.push(args.join(' '))
      originalLog(...args)
    }
    
    console.error = (...args) => {
      capturedLogs.push('ERROR: ' + args.join(' '))
      originalError(...args)
    }
    
    try {
      const testResults = await testStorageBuckets()
      setResults(testResults)
      setLogs(capturedLogs)
    } finally {
      // Restore console
      console.log = originalLog
      console.error = originalError
      setTesting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Storage Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Your Storage Configuration</h2>
        <p className="text-gray-600 mb-4">
          Click the button below to test if your Supabase storage buckets are configured correctly.
        </p>
        
        <button
          onClick={runTest}
          disabled={testing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Storage Tests'}
        </button>
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-gray-50">
              <span className="font-medium">property-photos bucket:</span>
              <span className={results.propertyPhotos ? 'text-green-600' : 'text-red-600'}>
                {results.propertyPhotos ? '✅ Working' : '❌ Not found'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded bg-gray-50">
              <span className="font-medium">report-pdfs bucket:</span>
              <span className={results.reportPdfs ? 'text-green-600' : 'text-red-600'}>
                {results.reportPdfs ? '✅ Working' : '❌ Not found'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded bg-gray-50">
              <span className="font-medium">Upload capability:</span>
              <span className={results.upload ? 'text-green-600' : 'text-red-600'}>
                {results.upload ? '✅ Working' : '❌ Failed'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded bg-gray-50">
              <span className="font-medium">Public access:</span>
              <span className={results.publicAccess ? 'text-green-600' : 'text-red-600'}>
                {results.publicAccess ? '✅ Working' : '❌ Failed'}
              </span>
            </div>
          </div>
          
          {Object.values(results).every(v => v) ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 All tests passed! Your storage is configured correctly.
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">
                ⚠️ Some tests failed. Please check:
              </p>
              <ul className="list-disc list-inside text-yellow-700 text-sm">
                <li>Both buckets exist with exact names: "property-photos" and "report-pdfs"</li>
                <li>Both buckets are set to PUBLIC access</li>
                <li>Your database project URL and anon key are correct in .env.local</li>
              </ul>
              <div className="inline-block mt-3 text-gray-600">
                Check storage configuration in your dashboard
              </div>
            </div>
          )}
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-lg shadow p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <pre className="text-sm overflow-x-auto">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('ERROR:') ? 'text-red-400' : ''}>
                {log}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  )
}