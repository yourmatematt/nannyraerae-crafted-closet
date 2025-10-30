import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import AdminDebugger from '@/components/admin/AdminDebugger'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔑 ADMIN LOGIN: Starting login process for:', email)

    try {
      // Step 1: Authenticate with Supabase
      console.log('🔑 ADMIN LOGIN: Attempting authentication...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // If remember me is checked, session will last 30 days, otherwise 1 day
          sessionDurationInSeconds: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        }
      })

      if (authError) {
        console.error('❌ ADMIN LOGIN: Authentication failed:', authError)
        throw authError
      }

      console.log('✅ ADMIN LOGIN: Authentication successful:', {
        userId: data.user?.id,
        userEmail: data.user?.email
      })

      // Step 2: Check if user is admin by both ID and email
      console.log('🔍 ADMIN LOGIN: Checking admin status...')

      // Check by ID first
      const adminCheckById = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)

      console.log('📊 ADMIN LOGIN: Admin check by ID result:', JSON.stringify(adminCheckById, null, 2))

      // Check by email as backup
      const adminCheckByEmail = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)

      console.log('📊 ADMIN LOGIN: Admin check by email result:', JSON.stringify(adminCheckByEmail, null, 2))

      // Supabase returns { data, error }
      const isAdmin = (adminCheckById?.data && adminCheckById.data.length > 0) ||
                      (adminCheckByEmail?.data && adminCheckByEmail.data.length > 0)

      console.log('🎯 ADMIN LOGIN: Is admin?', isAdmin)
      console.log('🔍 ADMIN LOGIN: Admin by ID check:', {
        hasData: !!adminCheckById?.data,
        dataLength: adminCheckById?.data?.length,
        hasError: !!adminCheckById?.error
      })
      console.log('🔍 ADMIN LOGIN: Admin by email check:', {
        hasData: !!adminCheckByEmail?.data,
        dataLength: adminCheckByEmail?.data?.length,
        hasError: !!adminCheckByEmail?.error
      })

      if (!isAdmin) {
        console.error('❌ ADMIN LOGIN: User is not authorized as admin')
        await supabase.auth.signOut()
        throw new Error('You are not authorized to access the admin panel')
      }

      console.log('✅ ADMIN LOGIN: Admin authorization successful, redirecting to dashboard')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('💥 ADMIN LOGIN: Login failed:', error)
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Debug Tool - Remove this in production */}
        <div className="mx-auto">
          <AdminDebugger />
        </div>
      </div>
    </div>
  )
}