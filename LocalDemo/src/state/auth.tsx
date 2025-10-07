import React, { createContext, useContext, useState } from 'react';

interface User { id: string; name: string; email: string; }
interface DemoAuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({ id: 'demo', name: 'Demo User', email: 'demo@example.com' });
  return (
    <DemoAuthContext.Provider value={{ isAuthenticated: !!user, user, login: () => setUser({ id:'demo', name:'Demo User', email:'demo@example.com'}), logout: () => setUser(null) }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth must be used within DemoAuthProvider');
  return ctx;
}
