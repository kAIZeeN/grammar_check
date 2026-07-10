import { useState } from 'react'
import Signup from './signup'
import Login from './login'
import Page from './page'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authView, setAuthView] = useState('signup') 

  if (isLoggedIn) {
    return <Page onLogout={() => setIsLoggedIn(false)} />
  }

  return authView === 'signup' ? (
    <Signup
      onLoginSuccess={() => setIsLoggedIn(true)}
      onSwitchToLogin={() => setAuthView('login')}
    />
  ) : (
    <Login
      onLoginSuccess={() => setIsLoggedIn(true)}
      onSwitchToSignup={() => setAuthView('signup')}
    />
  )
}

export default App
