import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('demo.user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('demo.user', JSON.stringify(user))
      else localStorage.removeItem('demo.user')
    } catch {}
  }, [user])

  const loginDemo = (name = 'Demo User', roles = ['Admin']) => {
    setUser({ name, roles })
  }
  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, loginDemo, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
