import { ApiError, createApiClient } from './api'
import type { Customer, CustomerService } from '../types/customer'

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return (
    (typeof c.id === 'string' || typeof c.id === 'number') &&
    typeof c.name === 'string' &&
    typeof c.email === 'string' &&
    typeof c.company === 'string' &&
    typeof c.createdAt === 'string' &&
    Number.isFinite(Date.parse(c.createdAt)) &&
    ['active', 'pending', 'inactive'].includes(String(c.status)) &&
    (c.phone === undefined || typeof c.phone === 'string') &&
    (c.industry === undefined || typeof c.industry === 'string')
  )
}

function unwrap(value: unknown): unknown {
  return value && typeof value === 'object' && 'data' in value
    ? value.data
    : value
}

function parseCustomer(value: unknown): Customer {
  const customer = unwrap(value)
  if (!isCustomer(customer))
    throw new ApiError('The API returned an unexpected customer format.', 200)
  return customer
}

export function createCustomerService(
  getToken: () => string | null,
): CustomerService {
  const request = createApiClient(getToken)
  return {
    async list(signal) {
      const data = unwrap(await request('/customers', { signal }))
      if (!Array.isArray(data) || !data.every(isCustomer)) {
        throw new ApiError(
          'The API returned an unexpected customer list format.',
          200,
        )
      }
      return data
    },
    async get(id, signal) {
      return parseCustomer(
        await request(`/customers/${encodeURIComponent(id)}`, { signal }),
      )
    },
    async create(input) {
      return parseCustomer(
        await request('/customers', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      )
    },
  }
}
