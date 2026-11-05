import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { PortalProvider } from './state/PortalContext'
import { demoCustomers } from './data/demo'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function renderPortal(path = '/', demo = false) {
  vi.stubEnv('VITE_DEMO_MODE', String(demo))
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PortalProvider>
        <App />
      </PortalProvider>
    </MemoryRouter>,
  )
}

describe('customer workspace', () => {
  it('shows loading, an actionable API error, and explicitly opted-in demo data', async () => {
    let reject: (error: Error) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((_resolve, rejectPromise) => {
            reject = rejectPromise
          }),
      ),
    )
    renderPortal()
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    reject(new Error('offline'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cannot reach the API',
    )
    await userEvent.click(
      screen.getByRole('button', { name: /Explore with demo data/ }),
    )
    expect(await screen.findByText('Olivia Rhye')).toBeInTheDocument()
    expect(screen.getByText(/You’re exploring sample data/)).toBeInTheDocument()
  })

  it('supports customer search, empty matches, status filters, and details', async () => {
    renderPortal('/customers', true)
    expect(await screen.findByText('Olivia Rhye')).toBeInTheDocument()
    const search = screen.getByRole('textbox', { name: 'Search customers' })
    await userEvent.type(search, 'no such customer')
    expect(screen.getByText('No matching customers')).toBeInTheDocument()
    await userEvent.clear(search)
    await userEvent.click(screen.getByRole('button', { name: 'Pending' }))
    expect(screen.getByText('Lana Steiner')).toBeInTheDocument()
    expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'All customers' }))
    await userEvent.click(screen.getByText('Olivia Rhye'))
    expect(
      await screen.findByRole('heading', { name: 'Olivia Rhye' }),
    ).toBeInTheDocument()
    expect(screen.getByText('+1 (415) 555-0101')).toBeInTheDocument()
  })

  it('creates a demo customer and retains it through navigation', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderPortal('/customers/new', true)
    await userEvent.type(screen.getByLabelText(/Full name/), 'Jane Doe')
    await userEvent.type(
      screen.getByLabelText(/Email address/),
      'jane@example.com',
    )
    await userEvent.type(screen.getByLabelText(/^Company/), 'Example Company')
    await userEvent.click(
      screen.getByRole('button', { name: 'Create customer' }),
    )
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Customer created')
    expect(fetchMock).not.toHaveBeenCalled()
    await userEvent.click(screen.getByText('Jane Doe'))
    expect(
      await screen.findByRole('heading', { name: 'Jane Doe' }),
    ).toBeInTheDocument()
  })

  it('shows empty API lists without inventing data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')))
    renderPortal('/customers')
    expect(
      await screen.findByText('Your next great relationship starts here'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument()
  })

  it('preserves form values after an API creation error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 500 })),
    )
    renderPortal('/customers/new')
    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^Company/), {
      target: { value: 'Example' },
    })
    await userEvent.click(
      screen.getByRole('button', { name: 'Create customer' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Request failed (500)',
    )
    expect(screen.getByLabelText(/Full name/)).toHaveValue('Jane Doe')
    expect(
      screen.getByRole('button', { name: 'Create customer' }),
    ).toBeEnabled()
  })

  it('paginates without losing filters', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            ...demoCustomers,
            {
              ...demoCustomers[0],
              id: 'ninth',
              name: 'Ninth Customer',
              createdAt: '2020-01-01',
            },
          ]),
        ),
      ),
    )
    renderPortal('/customers')
    await screen.findByText('Olivia Rhye')
    expect(screen.queryByText('Ninth Customer')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() =>
      expect(screen.getByText('Ninth Customer')).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
