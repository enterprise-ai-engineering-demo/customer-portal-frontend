export type CustomerStatus = 'active' | 'pending' | 'inactive'

export interface Customer {
  id: string | number
  name: string
  email: string
  company: string
  phone?: string
  industry?: string
  status: CustomerStatus
  createdAt: string
}

export interface CreateCustomerInput {
  name: string
  email: string
  company: string
  phone: string
  industry: string
  status: CustomerStatus
}

export interface CustomerService {
  list(signal?: AbortSignal): Promise<Customer[]>
  get(id: string, signal?: AbortSignal): Promise<Customer>
  create(input: CreateCustomerInput): Promise<Customer>
}
