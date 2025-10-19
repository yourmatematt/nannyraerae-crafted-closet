import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('🔐 AUTH CONTEXT: Getting initial session...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ AUTH CONTEXT: Error getting session:', error)
      }

      if (session?.user) {
        console.log('✅ AUTH CONTEXT: Initial session found:', {
          id: session.user.id,
          email: session.user.email
        })
      } else {
        console.log('❌ AUTH CONTEXT: No initial session found')
      }

      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔐 AUTH CONTEXT: Auth state changed - Event: ${event}`)

        if (session?.user) {
          console.log('✅ AUTH CONTEXT: User session updated:', {
            id: session.user.id,
            email: session.user.email
          })
        } else {
          console.log('❌ AUTH CONTEXT: User session cleared')
        }

        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}