import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/print.css'
import App from './App.tsx'
import { StoreProvider } from './store'
import { LockScreen } from './components/LockScreen'
import './registerSW'

// The store (and everything in it) only ever loads after the password
// has been set or verified -- LockScreen is what actually calls
// setEncryptionKey() in ../storage/db.ts, so mounting StoreProvider any
// earlier would just fail trying to read with no key yet.
function RootGate() {
  const [unlocked, setUnlocked] = useState(false)
  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootGate />
  </StrictMode>,
)
