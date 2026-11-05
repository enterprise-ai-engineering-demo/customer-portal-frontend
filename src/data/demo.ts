import type { Customer, CustomerService } from '../types/customer'
import { ApiError } from '../services/api'

export const demoCustomers: Customer[] = [
  {
    id: 'demo-1',
    name: 'Olivia Rhye',
    email: 'olivia@acme.com',
    company: 'Acme Corporation',
    industry: 'Technology',
    phone: '+1 (415) 555-0101',
    status: 'active',
    createdAt: '2026-11-04T10:00:00Z',
  },
  {
    id: 'demo-2',
    name: 'Phoenix Baker',
    email: 'phoenix@layers.design',
    company: 'Layers',
    industry: 'Design',
    phone: '+1 (415) 555-0102',
    status: 'active',
    createdAt: '2026-11-03T11:00:00Z',
  },
  {
    id: 'demo-3',
    name: 'Lana Steiner',
    email: 'lana@sisyphus.com',
    company: 'Sisyphus',
    industry: 'Consulting',
    status: 'pending',
    createdAt: '2026-11-02T09:00:00Z',
  },
  {
    id: 'demo-4',
    name: 'Demi Wilkinson',
    email: 'demi@catalog.com',
    company: 'Catalog',
    industry: 'Commerce',
    status: 'active',
    createdAt: '2026-10-28T15:00:00Z',
  },
  {
    id: 'demo-5',
    name: 'Drew Cano',
    email: 'drew@circooles.com',
    company: 'Circooles',
    industry: 'Technology',
    status: 'active',
    createdAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'demo-6',
    name: 'Natali Craig',
    email: 'natali@hourglass.app',
    company: 'Hourglass',
    industry: 'Technology',
    status: 'inactive',
    createdAt: '2026-10-19T13:00:00Z',
  },
  {
    id: 'demo-7',
    name: 'Andi Lane',
    email: 'andi@command.com',
    company: 'Command',
    industry: 'Finance',
    status: 'active',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'demo-8',
    name: 'Kate Morrison',
    email: 'kate@quotient.co',
    company: 'Quotient',
    industry: 'Finance',
    status: 'pending',
    createdAt: '2026-09-25T10:00:00Z',
  },
]

export function createDemoService(): CustomerService {
  const customers = demoCustomers.map((customer) => ({ ...customer }))
  return {
    async list() {
      return [...customers]
    },
    async get(id) {
      const customer = customers.find((item) => String(item.id) === id)
      if (!customer)
        throw new ApiError('This customer could not be found.', 404)
      return customer
    },
    async create(input) {
      const customer: Customer = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      customers.unshift(customer)
      return customer
    },
  }
}
