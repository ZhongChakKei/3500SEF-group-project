import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div>
      <h3>Login</h3>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={() => alert(`Demo login for ${email}`)}>Login</button>
    </div>
  )
}

function Register(){
  return (
    <div>
      <h3>Register (Admin or Invite Only)</h3>
      <p>Demo only. No persistence.</p>
    </div>
  )
}

function Forgot(){
  return <p>Forgot password (demo)</p>
}

export default function Auth(){
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot" element={<Forgot />} />
    </Routes>
  )
}
