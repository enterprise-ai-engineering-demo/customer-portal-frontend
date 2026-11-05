import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { usePortal } from '../state/PortalContext'
import { useAsync } from '../hooks/useAsync'
import {
  CustomerTable,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/CustomerUI'
import type { Customer } from '../types/customer'

function exportCustomers(customers: Customer[]) {
  const cell = (value: string) => {
    // Neutralize spreadsheet formula prefixes, including leading control characters.
    const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value
    return `"${safe.replaceAll('"', '""')}"`
  }
  const csv = [
    ['Name', 'Email', 'Company', 'Phone', 'Industry', 'Status', 'Created at'],
    ...customers.map((c) => [
      c.name,
      c.email,
      c.company,
      c.phone || '',
      c.industry || '',
      c.status,
      c.createdAt,
    ]),
  ]
    .map((row) => row.map(cell).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'northstar-customers.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function Customers() {
  const { service } = usePortal()
  const load = useCallback(
    (signal: AbortSignal) => service.list(signal),
    [service],
  )
  const { data, error, loading, retry } = useAsync(load)
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState(Boolean(params.get('created')))
  const query = params.get('q') || ''
  const status = params.get('status') || 'all'
  const rawPage = Number(params.get('page') || 1)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const filtered = (data || [])
    .filter((c) => {
      const matchesText =
        `${c.name} ${c.email} ${c.company} ${c.industry || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      return matchesText && (status === 'all' || c.status === status)
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8))
  const currentPage = Math.min(page, pageCount)
  const changeFilter = (key: string, value: string) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" />
            YOUR NETWORK, CONNECTED
          </div>
          <h1>
            Customers<span className="heading-dot">.</span>
          </h1>
          <p>Every customer has a story. Keep yours all in one place.</p>
        </div>
        <div className="button-row">
          <button
            className="button secondary"
            disabled={!filtered.length || loading}
            onClick={() => exportCustomers(filtered)}
          >
            <ArrowDownToLine size={16} />
            Export CSV
          </button>
          <Link className="button primary" to="/customers/new">
            <Plus size={17} />
            Add customer
          </Link>
        </div>
      </div>
      {notice && (
        <div className="success-notice" role="status">
          Customer created. A new relationship, ready to grow.
          <button
            className="icon-button"
            aria-label="Dismiss confirmation"
            onClick={() => {
              setNotice(false)
              changeFilter('created', '')
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <section className="panel customers-panel">
        <div className="panel-heading">
          <div className="title-with-count">
            <h2>All customers</h2>
            {data && <span className="count-badge">{data.length}</span>}
          </div>
          <span className="subtle-label">Your relationship directory</span>
        </div>
        <div className="table-toolbar">
          <div
            className="filter-tabs"
            role="group"
            aria-label="Filter by customer status"
          >
            {['all', 'active', 'pending', 'inactive'].map((value) => (
              <button
                key={value}
                className={status === value ? 'selected' : ''}
                onClick={() => changeFilter('status', value)}
              >
                {value === 'all'
                  ? 'All customers'
                  : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
          <label className="table-search">
            <Search size={16} />
            <span className="sr-only">Search customers</span>
            <input
              value={query}
              onChange={(event) => changeFilter('q', event.target.value)}
              placeholder="Search name, company, email..."
            />
            {query && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => changeFilter('q', '')}
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} retry={retry} />
        ) : !data?.length ? (
          <EmptyState />
        ) : !filtered.length ? (
          <EmptyState filtered />
        ) : (
          <>
            <CustomerTable
              customers={filtered.slice((currentPage - 1) * 8, currentPage * 8)}
            />
            <div className="pagination">
              <span>
                Showing {(currentPage - 1) * 8 + 1}–
                {Math.min(currentPage * 8, filtered.length)} of{' '}
                {filtered.length} customers
              </span>
              <div>
                <button
                  className="button secondary compact"
                  disabled={currentPage === 1}
                  onClick={() => changeFilter('page', String(currentPage - 1))}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>
                <span className="page-number">
                  {currentPage} / {pageCount}
                </span>
                <button
                  className="button secondary compact"
                  disabled={currentPage === pageCount}
                  onClick={() => changeFilter('page', String(currentPage + 1))}
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <p className="directory-note">
        <SlidersHorizontal size={14} />A little organization goes a long way.
        Search and filter to find the right connection.
      </p>
    </div>
  )
}
