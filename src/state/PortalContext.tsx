import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CustomerService } from '../types/customer'
import { createCustomerService } from '../services/customers'
import { createDemoService } from '../data/demo'

interface PortalState {
  service: CustomerService
  demo: boolean
  setDemo: (value: boolean) => void
  token: string
  setToken: (value: string) => void
}

const PortalContext = createContext<PortalState | null>(null)

export function PortalProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(import.meta.env.VITE_DEMO_MODE === 'true')
  const [token, setToken] = useState('')
  const demoService = useMemo(() => createDemoService(), [])
  const service = useMemo(
    () => (demo ? demoService : createCustomerService(() => token)),
    [demo, demoService, token],
  )

  return (
    <PortalContext.Provider value={{ service, demo, setDemo, token, setToken }}>
      {children}
    </PortalContext.Provider>
  )
}

// Context and its hook intentionally share one module.
// eslint-disable-next-line react-refresh/only-export-components
export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) throw new Error('usePortal must be used within PortalProvider')
  return context
}
