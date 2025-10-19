import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 ADMIN CHECK: Starting admin status check...')
      const debug: string[] = []

      // Step 1: Check if user exists
      if (!user) {
        console.log('❌ ADMIN CHECK: No user found in context')
        debug.push('No user in context')
        setDebugInfo(debug)
        setLoading(false)
        return
      }

      console.log('✅ ADMIN CHECK: User found in context:', {
        id: user.id,
        email: user.email,
        userObject: user
      })
      debug.push(`User found: ${user.email} (ID: ${user.id})`)

      try {
        // Step 2: Get current session to make sure we have a valid session
        console.log('🔍 ADMIN CHECK: Getting current session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ ADMIN CHECK: Session error:', sessionError)
          debug.push(`Session error: ${sessionError.message}`)
          setDebugInfo(debug)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        if (!session) {
          console.log('❌ ADMIN CHECK: No active session found')
          debug.push('No active session')
          setDebugInfo(debug)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        console.log('✅ ADMIN CHECK: Active session found:', {
          userId: session.user.id,
          userEmail: session.user.email
        })
        debug.push(`Session active for: ${session.user.email}`)

        // Step 3: Try querying by both ID and email
        console.log('🔍 ADMIN CHECK: Querying admin_users by ID...')
        const adminCheckById = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', user.id)

        console.log('📊 ADMIN CHECK: Query by ID result:', JSON.stringify(adminCheckById, null, 2))

        if (adminCheckById.error) {
          debug.push(`Query by ID error: ${adminCheckById.error.message}`)
        } else {
          debug.push(`Query by ID returned ${adminCheckById.data?.length || 0} rows`)
        }

        console.log('🔍 ADMIN CHECK: Querying admin_users by email...')
        const adminCheckByEmail = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)

        console.log('📊 ADMIN CHECK: Query by email result:', JSON.stringify(adminCheckByEmail, null, 2))

        if (adminCheckByEmail.error) {
          debug.push(`Query by email error: ${adminCheckByEmail.error.message}`)
        } else {
          debug.push(`Query by email returned ${adminCheckByEmail.data?.length || 0} rows`)
        }

        // Step 4: Check if user is admin based on either query
        const isAdminByID = adminCheckById?.data && adminCheckById.data.length > 0 && !adminCheckById.error
        const isAdminByEmail = adminCheckByEmail?.data && adminCheckByEmail.data.length > 0 && !adminCheckByEmail.error
        const isUserAdmin = isAdminByID || isAdminByEmail

        console.log('🎯 ADMIN CHECK: Final admin status determination:', {
          isAdminByID,
          isAdminByEmail,
          finalIsAdmin: isUserAdmin,
          adminByIdHasData: !!adminCheckById?.data,
          adminByIdDataLength: adminCheckById?.data?.length,
          adminByEmailHasData: !!adminCheckByEmail?.data,
          adminByEmailDataLength: adminCheckByEmail?.data?.length
        })

        debug.push(`Admin check result: ${isUserAdmin ? 'ADMIN' : 'NOT ADMIN'}`)

        if (isUserAdmin) {
          console.log('✅ ADMIN CHECK: User is authorized as admin')
        } else {
          console.log('❌ ADMIN CHECK: User is NOT authorized as admin')
          console.log('💡 ADMIN CHECK: Make sure this user exists in admin_users table')
        }

        setDebugInfo(debug)
        setIsAdmin(isUserAdmin)

      } catch (error) {
        console.error('💥 ADMIN CHECK: Unexpected error during admin check:', error)
        debug.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setDebugInfo(debug)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdminStatus()
    }
  }, [user, authLoading])

  // Add debug info to the loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading admin verification...</div>
          {debugInfo.length > 0 && (
            <div className="text-sm text-gray-600 max-w-md">
              <div className="font-medium mb-2">Debug Info:</div>
              {debugInfo.map((info, i) => (
                <div key={i} className="text-left">• {info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🚫 ADMIN ROUTE: Redirecting to login - no user')
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    console.log('🚫 ADMIN ROUTE: Redirecting to login - user not admin')
    console.log('📋 Final debug info:', debugInfo)
    return <Navigate to="/admin/login" replace />
  }

  console.log('✅ ADMIN ROUTE: Access granted!')
  return <>{children}</>
}