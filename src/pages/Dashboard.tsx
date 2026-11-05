import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  Plus,
  Users,
} from 'lucide-react'
import { usePortal } from '../state/PortalContext'
import { useAsync } from '../hooks/useAsync'
import {
  Avatar,
  CustomerTable,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/CustomerUI'
import { formatDate } from '../utils/format'
import type { Customer } from '../types/customer'

function monthBuckets(customers: Customer[], count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - count + index + 1,
      1,
    )
    return {
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      count: customers.filter((customer) => {
        const created = new Date(customer.createdAt)
        return (
          created.getMonth() === date.getMonth() &&
          created.getFullYear() === date.getFullYear()
        )
      }).length,
    }
  })
}

export function Dashboard() {
  const { service } = usePortal()
  const load = useCallback(
    (signal: AbortSignal) => service.list(signal),
    [service],
  )
  const { data, loading, error, retry } = useAsync(load)
  const [period, setPeriod] = useState(6)
  const recent = [...(data || [])].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )
  const firstByCompany = new Map<string, Customer>()
  for (const customer of [...recent].reverse()) {
    const company = customer.company.trim().toLowerCase()
    if (company && !firstByCompany.has(company))
      firstByCompany.set(company, customer)
  }

  return (
    <div className="page dashboard-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" />
            YOUR WORKSPACE, AT A GLANCE
          </div>
          <h1>
            A clearer view of your customers
            <span className="heading-dot">.</span>
          </h1>
          <p>
            Stronger relationships start with the right insights. Here’s where
            you stand.
          </p>
        </div>
        <Link className="button primary" to="/customers/new">
          <Plus size={17} />
          Add customer
        </Link>
      </div>
      <div className="overview-subheading">
        <div>
          <span className="section-marker" />
          Workspace overview
        </div>
        <span className="date-range">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={retry} />
      ) : (
        data && (
          <>
            <div className="metric-grid">
              {[
                {
                  label: 'Total customers',
                  value: data.length,
                  icon: Users,
                  note: 'Across your workspace',
                  tone: 'green',
                  records: data,
                },
                {
                  label: 'Active customers',
                  value: data.filter((c) => c.status === 'active').length,
                  icon: CircleCheck,
                  note: `${data.length ? Math.round((data.filter((c) => c.status === 'active').length / data.length) * 100) : 0}% of your customer base`,
                  tone: 'orange',
                  records: data.filter((c) => c.status === 'active'),
                },
                {
                  label: 'Pending customers',
                  value: data.filter((c) => c.status === 'pending').length,
                  icon: Clock3,
                  note: 'Ready for the next step',
                  tone: 'purple',
                  records: data.filter((c) => c.status === 'pending'),
                },
                {
                  label: 'Companies',
                  value: firstByCompany.size,
                  icon: Building2,
                  note: 'Relationships that matter',
                  tone: 'blue',
                  records: [...firstByCompany.values()],
                },
              ].map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <div className="metric-top">
                    <span>{metric.label}</span>
                    <span className={`metric-icon ${metric.tone}`}>
                      <metric.icon size={17} />
                    </span>
                  </div>
                  <div className="metric-value">
                    {metric.value.toLocaleString()}
                    <MiniTrend customers={metric.records} tone={metric.tone} />
                  </div>
                  <div className="metric-note">
                    <span className={`metric-note-dot ${metric.tone}`} />
                    {metric.note}
                  </div>
                </article>
              ))}
            </div>
            <div className="insights-grid">
              <section className="panel growth-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Customer growth</h2>
                    <p>A little progress, every month.</p>
                  </div>
                  <label className="select-control">
                    <span className="sr-only">Growth chart period</span>
                    <select
                      value={period}
                      onChange={(event) =>
                        setPeriod(Number(event.target.value))
                      }
                    >
                      <option value={6}>Last 6 months</option>
                      <option value={12}>Last 12 months</option>
                    </select>
                    <ChevronDown size={13} />
                  </label>
                </div>
                <GrowthChart customers={data} period={period} />
                <div className="chart-footer">
                  <span>
                    <span className="legend-dot" />
                    New customers
                  </span>
                  <span>
                    Built one relationship at a time
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </section>
              <section className="panel health-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Customer health</h2>
                    <p>Your relationships, in balance.</p>
                  </div>
                  <span className="soft-icon">
                    <Users size={17} />
                  </span>
                </div>
                <HealthChart customers={data} />
              </section>
            </div>
            <section className="panel recent-panel">
              <div className="panel-heading">
                <div className="title-with-count">
                  <h2>Recently added customers</h2>
                  <span className="count-badge">{data.length}</span>
                </div>
                <Link className="text-link" to="/customers">
                  View all customers
                  <ArrowRight size={16} />
                </Link>
              </div>
              {data.length ? (
                <CustomerTable customers={recent.slice(0, 5)} />
              ) : (
                <EmptyState />
              )}
              <div className="table-footer">
                <span>A growing network. A world of possibilities.</span>
                <span>
                  Showing {Math.min(data.length, 5)} of {data.length} customers
                </span>
              </div>
            </section>
            <div className="bottom-grid">
              <section className="relationship-callout">
                <span className="callout-icon">
                  <Sparkle />
                </span>
                <div>
                  <span className="eyebrow">MAKE ROOM FOR WHAT’S NEXT</span>
                  <h2>Your next great connection starts here.</h2>
                  <p>
                    Bring your customers together. Build something that lasts.
                  </p>
                </div>
                <Link to="/customers/new" className="button light">
                  Add a customer
                  <ArrowUpRight size={16} />
                </Link>
              </section>
              <section className="panel activity-panel">
                <div className="panel-heading">
                  <h2>Latest activity</h2>
                  <span className="live-label">
                    <span />
                    Customer records
                  </span>
                </div>
                {data.length ? (
                  <div className="activity-item">
                    <Avatar name={recent[0].name} />
                    <div>
                      <strong>Newest relationship</strong>
                      <p>{recent[0].company} joined your workspace.</p>
                      <small>{formatDate(recent[0].createdAt)}</small>
                    </div>
                  </div>
                ) : (
                  <p className="muted activity-empty">
                    New customer activity will appear here.
                  </p>
                )}
              </section>
            </div>
          </>
        )
      )}
    </div>
  )
}

function MiniTrend({
  customers,
  tone,
}: {
  customers: Customer[]
  tone: string
}) {
  const buckets = monthBuckets(customers, 6)
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count))
  const path = buckets
    .map(
      (bucket, index) =>
        `${index ? 'L' : 'M'}${2 + index * 18},${32 - (bucket.count / max) * 28}`,
    )
    .join(' ')
  return (
    <svg
      className={`sparkline ${tone}`}
      viewBox="0 0 95 36"
      role="img"
      aria-label={`Monthly additions: ${buckets.map((bucket) => `${bucket.label}: ${bucket.count}`).join(', ')}`}
    >
      <path d={path} />
    </svg>
  )
}

function GrowthChart({
  customers,
  period,
}: {
  customers: Customer[]
  period: number
}) {
  const buckets = monthBuckets(customers, period)
  const max = Math.max(4, ...buckets.map((bucket) => bucket.count))
  const width = 620
  const height = 172
  const points = buckets.map((bucket, index) => [
    (index * width) / (period - 1),
    height - (bucket.count / max) * height,
  ])
  const path = points
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`)
    .join(' ')
  return (
    <div
      className="growth-chart"
      role="img"
      aria-label={`New customers over the last ${period} months: ${buckets.map((b) => `${b.label}: ${b.count}`).join(', ')}`}
    >
      <div className="chart-axis">
        {[
          max,
          Math.round(max * 0.75),
          Math.round(max * 0.5),
          Math.round(max * 0.25),
          0,
        ].map((value, i) => (
          <span key={i}>{value}</span>
        ))}
      </div>
      <div className="chart-plot">
        <div className="chart-grid">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <svg
          viewBox={`-8 -8 ${width + 16} ${height + 20}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#83b79b" stopOpacity=".30" />
              <stop offset="100%" stopColor="#83b79b" stopOpacity=".015" />
            </linearGradient>
          </defs>
          <path
            d={`${path} L${width},${height} L0,${height} Z`}
            fill="url(#growthFill)"
          />
          <path
            d={path}
            fill="none"
            stroke="#438568"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          {points.map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              stroke="#438568"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="chart-months">
          {buckets.map((bucket, index) => (
            <span key={index}>{bucket.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function HealthChart({ customers }: { customers: Customer[] }) {
  const total = customers.length
  const active = customers.filter((c) => c.status === 'active').length
  const pending = customers.filter((c) => c.status === 'pending').length
  const activeAngle = total ? (active / total) * 360 : 0
  const pendingAngle = total ? (pending / total) * 360 : 0
  return (
    <>
      <div className="donut-wrap">
        <div
          className="donut"
          style={{
            background: total
              ? `conic-gradient(#2c6753 0deg ${activeAngle}deg, #edb77b ${activeAngle}deg ${activeAngle + pendingAngle}deg, #e1e6e2 ${activeAngle + pendingAngle}deg 360deg)`
              : '#e1e6e2',
          }}
        >
          <div>
            <strong>{total}</strong>
            <span>Total customers</span>
          </div>
        </div>
      </div>
      <div className="health-legend">
        {(['active', 'pending', 'inactive'] as const).map((status) => {
          const count = customers.filter((c) => c.status === status).length
          return (
            <div key={status}>
              <span className={`health-dot ${status}`} />
              <span>{status[0].toUpperCase() + status.slice(1)}</span>
              <strong>{count}</strong>
              <small>{total ? Math.round((count / total) * 100) : 0}%</small>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
      <path d="m20 2 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z" fill="currentColor" />
    </svg>
  )
}
