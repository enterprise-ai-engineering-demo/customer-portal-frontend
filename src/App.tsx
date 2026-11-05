import { useState } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { usePortal } from './state/PortalContext'
import { ConnectionDialog } from './components/ConnectionDialog'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { CustomerDetails } from './pages/CustomerDetails'
import { CreateCustomer } from './pages/CreateCustomer'

export function App() {
  const { demo } = usePortal()
  const [settings, setSettings] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const section = location.pathname === '/' ? 'Overview' : 'Customers'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Sparkles size={25} strokeWidth={1.7} />
          </span>
          northstar<span className="brand-dot">.</span>
        </Link>
        <div className="workspace-label">
          <div className="workspace-icon">N</div>
          <div>
            <strong>Customer workspace</strong>
            <small>Enterprise edition</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={19} />
            Overview
          </NavLink>
          <NavLink to="/customers" onClick={() => setMenuOpen(false)}>
            <Users size={19} />
            Customers
            <span className="nav-arrow">
              <ArrowUpRight size={14} />
            </span>
          </NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="note-orbit">
            <ArrowDownLeft size={22} />
          </span>
          <h3>
            Good relationships.
            <br />
            Great possibilities.
          </h3>
          <p>Your customers, at the center of everything you do.</p>
          <Link to="/customers/new" onClick={() => setMenuOpen(false)}>
            Grow your network
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <button
            onClick={() => {
              setSettings(true)
              setMenuOpen(false)
            }}
          >
            <Settings2 size={18} />
            API settings
          </button>
          <a
            href="https://github.com/enterprise-ai-engineering-demo/customer-portal-frontend#readme"
            target="_blank"
            rel="noreferrer"
          >
            <CircleHelp size={18} />
            Documentation
            <ArrowUpRight size={14} />
          </a>
          <div className="profile">
            <div className="profile-avatar">WS</div>
            <div>
              <strong>Workspace admin</strong>
              <small>Customer operations</small>
            </div>
            <span className="profile-online" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <form
              className="global-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                const query =
                  new FormData(event.currentTarget).get('search')?.toString() ||
                  ''
                navigate(`/customers?q=${encodeURIComponent(query)}`)
              }}
            >
              <Search size={16} />
              <input
                name="search"
                aria-label="Search workspace customers"
                placeholder="Search anything..."
              />
              <span>
                <Command size={11} />↵
              </span>
            </form>
            <button
              className={`connection-pill ${demo ? 'is-demo' : ''}`}
              onClick={() => setSettings(true)}
            >
              <span />
              {demo ? 'Demo workspace' : 'API mode'}
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <Sparkles size={14} />
            <span>
              You’re exploring sample data. Changes are temporary and stay in
              this tab.
            </span>
            <button onClick={() => setSettings(true)}>
              Connect your API
              <ArrowUpRight size={13} />
            </button>
          </div>
        )}
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CreateCustomer />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="main-footer">
          <span>Thoughtfully connected. Powered by Northstar.</span>
          <span>
            <span className="footer-dot" />
            {demo ? 'Sample data environment' : 'Live API environment'}
          </span>
        </footer>
      </div>
      {settings && <ConnectionDialog onClose={() => setSettings(false)} />}
    </div>
  )
}

function NotFound() {
  const location = useLocation()
  if (location.pathname === '/dashboard') return <Navigate to="/" replace />
  return (
    <div className="state-card">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>A little off course.</h1>
      <p>This page doesn’t exist. Let’s get you back to your workspace.</p>
      <Link to="/" className="button primary">
        Back to overview
        <Plus size={16} />
      </Link>
    </div>
  )
}
