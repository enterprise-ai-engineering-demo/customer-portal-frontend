import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { usePortal } from '../state/PortalContext'
import type { CreateCustomerInput } from '../types/customer'

export function CreateCustomer() {
  const { service, demo } = usePortal()
  // Remount the form if its service changes; an in-flight write always belongs to its original service.
  return <CustomerForm key={`${demo}`} service={service} demo={demo} />
}

function CustomerForm({
  service,
  demo,
}: Pick<ReturnType<typeof usePortal>, 'service' | 'demo'>) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    const form = event.currentTarget
    const formData = new FormData(form)
    const status = formData.get('status')
    if (status !== 'active' && status !== 'pending' && status !== 'inactive') {
      setError('Choose a valid customer status.')
      return
    }
    const value = (name: string) => formData.get(name)?.toString().trim() || ''
    const input: CreateCustomerInput = {
      name: value('name'),
      email: value('email'),
      company: value('company'),
      phone: value('phone'),
      industry: value('industry'),
      status,
    }
    if (!input.name || !input.email || !input.company) {
      setError('Name, email, and company cannot be blank.')
      return
    }
    inFlight.current = true
    setSaving(true)
    setError(null)
    try {
      await service.create(input)
      if (active.current) navigate('/customers?created=1')
    } catch (failure) {
      if (active.current)
        setError(
          failure instanceof Error
            ? failure.message
            : 'Could not create the customer. Please try again.',
        )
    } finally {
      inFlight.current = false
      if (active.current) setSaving(false)
    }
  }

  return (
    <div className="page create-page">
      <Link className="back-link" to="/customers">
        <ArrowLeft size={16} />
        Back to customers
      </Link>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" />
            EVERY RELATIONSHIP STARTS SOMEWHERE
          </div>
          <h1>
            Meet your next customer<span className="heading-dot">.</span>
          </h1>
          <p>A few details now. Endless possibilities ahead.</p>
        </div>
      </div>
      <div className="create-grid">
        <form className="panel customer-form" onSubmit={submit}>
          <fieldset disabled={saving}>
            <legend>
              <span className="form-section-icon">
                <UserRound size={18} />
              </span>
              Customer details
            </legend>
            <p className="form-intro">
              The essentials for a personal connection.{' '}
              <span>Fields marked * are required.</span>
            </p>
            <div className="form-grid">
              <label className="field-label">
                Full name <span>*</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  placeholder="e.g. Olivia Rhye"
                />
              </label>
              <label className="field-label">
                Email address <span>*</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="olivia@company.com"
                />
              </label>
              <label className="field-label">
                Company <span>*</span>
                <input
                  name="company"
                  autoComplete="organization"
                  required
                  maxLength={160}
                  placeholder="e.g. Acme Corporation"
                />
              </label>
              <label className="field-label">
                Phone number <small>Optional</small>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  placeholder="+1 (555) 000-0000"
                />
              </label>
              <label className="field-label">
                Industry <small>Optional</small>
                <select name="industry" defaultValue="">
                  <option value="">Select an industry</option>
                  {[
                    'Technology',
                    'Finance',
                    'Healthcare',
                    'Commerce',
                    'Design',
                    'Consulting',
                    'Education',
                    'Manufacturing',
                    'Other',
                  ].map((industry) => (
                    <option key={industry}>{industry}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Relationship status <span>*</span>
                <select name="status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          </fieldset>
          {error && (
            <div className="form-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          <div className="form-actions">
            <span>
              <ShieldCheck size={16} />
              {demo
                ? 'Saved in this demo tab only'
                : 'Sent to your configured API'}
            </span>
            <div className="button-row">
              <Link
                className={`button secondary ${saving ? 'disabled-link' : ''}`}
                aria-disabled={saving}
                tabIndex={saving ? -1 : undefined}
                to="/customers"
                onClick={(event) => {
                  if (saving) event.preventDefault()
                }}
              >
                Cancel
              </Link>
              <button
                className="button primary"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className="spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create customer
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        <aside className="create-aside">
          <span className="large-soft-icon">
            <Building2 size={26} />
          </span>
          <h2>
            More than a record.
            <br />A new beginning.
          </h2>
          <p>
            Great customer experiences start with knowing who’s on the other
            side.
          </p>
          <ul>
            <li>
              <Check size={15} />
              One place for every relationship
            </li>
            <li>
              <Check size={15} />
              Clear, organized customer insights
            </li>
            <li>
              <Check size={15} />
              Built for your growing network
            </li>
          </ul>
          <div className="aside-tip">
            <span className="eyebrow">A LITTLE TIP</span>
            <p>
              Use a work email to make it easier to connect customers with their
              company.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
