import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminDebugger() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const runDiagnostics = async () => {
    setLoading(true)
    setResults([])

    try {
      addResult('🔍 Starting admin diagnostics...')

      // Step 1: Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`)
        return
      }

      if (!session) {
        addResult('❌ No active session found')
        return
      }

      addResult(`✅ Active session found for: ${session.user.email} (ID: ${session.user.id})`)

      // Step 2: Test admin_users table access with different approaches
      addResult('🔍 Testing admin_users table access...')

      // Try direct query by ID
      const adminCheckById = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)

      addResult(`📊 Query by ID result: ${JSON.stringify(adminCheckById, null, 2)}`)

      if (adminCheckById.error) {
        addResult(`❌ Query by ID failed: ${adminCheckById.error.message}`)
        addResult(`   Code: ${adminCheckById.error.code}, Details: ${adminCheckById.error.details}`)
      } else {
        addResult(`✅ Query by ID succeeded: ${adminCheckById.data?.length || 0} rows`)
        if (adminCheckById.data && adminCheckById.data.length > 0) {
          addResult(`   Found admin user: ${JSON.stringify(adminCheckById.data[0])}`)
        }
      }

      // Try direct query by email
      const adminCheckByEmail = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)

      addResult(`📊 Query by email result: ${JSON.stringify(adminCheckByEmail, null, 2)}`)

      if (adminCheckByEmail.error) {
        addResult(`❌ Query by email failed: ${adminCheckByEmail.error.message}`)
        addResult(`   Code: ${adminCheckByEmail.error.code}, Details: ${adminCheckByEmail.error.details}`)
      } else {
        addResult(`✅ Query by email succeeded: ${adminCheckByEmail.data?.length || 0} rows`)
        if (adminCheckByEmail.data && adminCheckByEmail.data.length > 0) {
          addResult(`   Found admin user: ${JSON.stringify(adminCheckByEmail.data[0])}`)
        }
      }

      // Try to query all admin users (this will show if RLS is blocking everything)
      const allAdminsCheck = await supabase
        .from('admin_users')
        .select('*')

      addResult(`📊 Query all admins result: ${JSON.stringify(allAdminsCheck, null, 2)}`)

      if (allAdminsCheck.error) {
        addResult(`❌ Query all admins failed: ${allAdminsCheck.error.message}`)
        addResult(`   This suggests RLS is blocking the query`)
      } else {
        addResult(`✅ Query all admins succeeded: ${allAdminsCheck.data?.length || 0} total rows`)
        addResult(`   This suggests RLS is working correctly`)
      }

      // Step 3: Test using service role (if available in env)
      addResult('🔍 Testing with potential service role access...')

      // Note: This would require a separate supabase client with service role key
      // For now, just indicate what to check

      addResult('💡 Diagnostic complete! Check the following:')
      addResult('   1. RLS policies on admin_users table')
      addResult('   2. User ID matches between auth.users and admin_users')
      addResult('   3. Email matches between auth.users and admin_users')
      addResult('   4. admin_users table structure and permissions')

    } catch (error) {
      addResult(`💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Authorization Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running Diagnostics...' : 'Run Admin Diagnostics'}
        </Button>

        {results.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 font-mono text-xs">
                {results.map((result, i) => (
                  <div key={i}>{result}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}