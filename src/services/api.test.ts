import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './api'
import { createCustomerService } from './customers'
import { demoCustomers } from '../data/demo'

afterEach(() => vi.unstubAllGlobals())

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockImplementation(
      async () => new Response(JSON.stringify(body), { status }),
    )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('API client', () => {
  it('sends the current JWT and JSON content headers', async () => {
    const fetchMock = mockResponse({})
    let token = 'first-token'
    const request = createApiClient(() => token, 'http://localhost:4000/api')
    await request('/customers', { method: 'POST', body: '{}' })
    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer first-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    token = 'updated-token'
    await request('/customers')
    expect(
      (fetchMock.mock.calls[1][1].headers as Headers).get('Authorization'),
    ).toBe('Bearer updated-token')
  })

  it('omits Authorization without a token', async () => {
    const fetchMock = mockResponse([])
    await createApiClient(() => null)('/customers')
    expect(
      (fetchMock.mock.calls[0][1].headers as Headers).has('Authorization'),
    ).toBe(false)
  })

  it.each([401, 403, 404, 500])(
    'surfaces HTTP %s as an explicit error',
    async (status) => {
      mockResponse({}, status)
      await expect(
        createApiClient(() => null)('/customers'),
      ).rejects.toMatchObject({ name: 'ApiError', status })
    },
  )

  it('handles non-JSON success and network failures explicitly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')))
    await expect(createApiClient(() => null)('/customers')).rejects.toThrow(
      'invalid JSON',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )
    await expect(createApiClient(() => null)('/customers')).rejects.toThrow(
      'Cannot reach the API',
    )
  })

  it('preserves abort errors and forwards the signal', async () => {
    const controller = new AbortController()
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      createApiClient(() => null)('/customers', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
  })
})

describe('customer service', () => {
  it('accepts raw and data-wrapped list responses', async () => {
    mockResponse(demoCustomers)
    expect(await createCustomerService(() => null).list()).toHaveLength(8)
    mockResponse({ data: demoCustomers })
    expect(await createCustomerService(() => null).list()).toHaveLength(8)
  })

  it('rejects invalid customer shapes and dates', async () => {
    mockResponse([{ ...demoCustomers[0], createdAt: 'invalid' }])
    await expect(
      createCustomerService(() => null).list(),
    ).rejects.toBeInstanceOf(ApiError)
    mockResponse({ data: [{ id: 1 }] })
    await expect(createCustomerService(() => null).list()).rejects.toThrow(
      'unexpected customer list',
    )
  })

  it('encodes identifiers and posts customer fields', async () => {
    const fetchMock = mockResponse({ data: demoCustomers[0] })
    const service = createCustomerService(() => 'token')
    await service.get('customer/one')
    expect(fetchMock.mock.calls[0][0]).toContain('/customers/customer%2Fone')
    const input = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Example',
      phone: '',
      industry: 'Technology',
      status: 'active' as const,
    }
    expect(await service.create(input)).toEqual(demoCustomers[0])
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(input)
    expect(fetchMock.mock.calls[1][1].method).toBe('POST')
  })
})
