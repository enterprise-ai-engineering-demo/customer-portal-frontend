import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Tag,
  UserRound,
} from 'lucide-react'
import { usePortal } from '../state/PortalContext'
import { useAsync } from '../hooks/useAsync'
import {
  Avatar,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '../components/CustomerUI'
import { formatDate } from '../utils/format'

export function CustomerDetails() {
  const { id = '' } = useParams()
  const { service } = usePortal()
  const load = useCallback(
    (signal: AbortSignal) => service.get(id, signal),
    [service, id],
  )
  const { data: customer, error, loading, retry } = useAsync(load)
  return (
    <div className="page details-page">
      <Link className="back-link" to="/customers">
        <ArrowLeft size={16} />
        Back to customers
      </Link>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={retry} />
      ) : (
        customer && (
          <>
            <div className="customer-profile-hero">
              <div className="profile-hero-pattern" />
              <div className="customer-profile-content">
                <Avatar name={customer.name} large />
                <div>
                  <div className="eyebrow">CUSTOMER PROFILE</div>
                  <h1>{customer.name}</h1>
                  <p>{customer.company}</p>
                </div>
                <StatusBadge status={customer.status} />
              </div>
            </div>
            <div className="details-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Customer information</h2>
                    <p>The details behind the relationship.</p>
                  </div>
                  <UserRound size={20} className="muted" />
                </div>
                <dl className="details-list">
                  <div>
                    <dt>
                      <UserRound size={16} />
                      Full name
                    </dt>
                    <dd>{customer.name}</dd>
                  </div>
                  <div>
                    <dt>
                      <Mail size={16} />
                      Email address
                    </dt>
                    <dd>
                      <a href={`mailto:${customer.email}`}>
                        {customer.email}
                        <ArrowUpRight size={14} />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Phone size={16} />
                      Phone number
                    </dt>
                    <dd>
                      {customer.phone || (
                        <span className="muted">Not provided</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Building2 size={16} />
                      Company
                    </dt>
                    <dd>{customer.company}</dd>
                  </div>
                  <div>
                    <dt>
                      <Tag size={16} />
                      Industry
                    </dt>
                    <dd>
                      {customer.industry || (
                        <span className="muted">Not specified</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <CalendarDays size={16} />
                      Customer since
                    </dt>
                    <dd>{formatDate(customer.createdAt)}</dd>
                  </div>
                </dl>
              </section>
              <aside className="panel relationship-summary">
                <span className="soft-icon">
                  <Building2 size={22} />
                </span>
                <h2>A connection worth knowing.</h2>
                <p>
                  {customer.company} is part of your customer network. Keep
                  their information close and every conversation personal.
                </p>
                <div className="summary-meta">
                  <span>Relationship status</span>
                  <StatusBadge status={customer.status} />
                </div>
                <div className="summary-meta">
                  <span>Customer ID</span>
                  <code>{customer.id}</code>
                </div>
              </aside>
            </div>
          </>
        )
      )}
    </div>
  )
}
