export default function DebugInfo() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>
        <strong>Database URL:</strong> {supabaseUrl || 'MISSING'}
      </div>
      <div>
        <strong>Database Key:</strong> {supabaseKey ? 'SET' : 'MISSING'}
      </div>
      <div>
        <strong>Mode:</strong> {import.meta.env.MODE}
      </div>
    </div>
  )
}