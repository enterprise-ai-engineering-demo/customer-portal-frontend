import { AlertCircle, ArrowRight, Inbox, RefreshCw, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Customer, CustomerStatus } from '../types/customer'
import { usePortal } from '../state/PortalContext'
import { formatDate, initials } from '../utils/format'

export function Avatar({
  name,
  large = false,
}: {
  name: string
  large?: boolean
}) {
  const tone = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5
  return (
    <span
      className={`avatar tone-${tone} ${large ? 'avatar-large' : ''}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={`status status-${status}`}>
      <span />
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  )
}

export function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <div className="loading-bars">
        <span />
        <span />
        <span />
      </div>
      Loading your workspace…
    </div>
  )
}

export function ErrorState({
  message,
  retry,
}: {
  message: string
  retry: () => void
}) {
  const { demo, setDemo } = usePortal()
  return (
    <div className="state-card" role="alert">
      <span className="state-icon error-icon">
        <AlertCircle size={25} />
      </span>
      <h2>We couldn’t load your data</h2>
      <p>{message}</p>
      <div className="button-row">
        <button className="button secondary" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </button>
        {!demo && (
          <button className="button primary" onClick={() => setDemo(true)}>
            Explore with demo data
            <ArrowRight size={16} />
          </button>
        )}
      </div>
      {!demo && <small>Demo mode uses sample records, not your API.</small>}
    </div>
  )
}

export function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="state-card">
      <span className="state-icon">
        {filtered ? <Inbox size={26} /> : <Users size={26} />}
      </span>
      <h2>
        {filtered
          ? 'No matching customers'
          : 'Your next great relationship starts here'}
      </h2>
      <p>
        {filtered
          ? 'Try a different search or status filter.'
          : 'Add your first customer to start building your workspace.'}
      </p>
      {!filtered && (
        <Link className="button primary" to="/customers/new">
          Add your first customer
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Company</th>
            <th scope="col">Status</th>
            <th scope="col">Date added</th>
            <th scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <Link
                  className="customer-cell"
                  to={`/customers/${encodeURIComponent(customer.id)}`}
                >
                  <Avatar name={customer.name} />
                  <span>
                    <strong>{customer.name}</strong>
                    <small>{customer.email}</small>
                  </span>
                </Link>
              </td>
              <td>
                <span className="company-name">{customer.company}</span>
                <small className="cell-secondary">
                  {customer.industry || 'Not specified'}
                </small>
              </td>
              <td>
                <StatusBadge status={customer.status} />
              </td>
              <td className="date-cell">{formatDate(customer.createdAt)}</td>
              <td>
                <Link
                  className="icon-link"
                  to={`/customers/${encodeURIComponent(customer.id)}`}
                  aria-label={`View ${customer.name}`}
                >
                  <ArrowRight size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
