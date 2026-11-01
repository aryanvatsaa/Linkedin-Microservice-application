import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'nexora.accessToken'
const USER_KEY = 'nexora.user'

function readStoredUser() {
  const value = sessionStorage.getItem(USER_KEY)
  if (!value || !sessionStorage.getItem(TOKEN_KEY)) {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
    }

    window.addEventListener('nexora:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('nexora:unauthorized', handleUnauthorized)
  }, [])

  const signIn = useCallback((authResponse) => {
    sessionStorage.setItem(TOKEN_KEY, authResponse.accessToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(authResponse.user))
    setUser(authResponse.user)
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut, updateUser }), [user, signIn, signOut, updateUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
