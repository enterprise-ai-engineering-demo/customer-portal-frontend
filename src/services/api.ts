export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
).replace(/\/+$/, '')

export function createApiClient(
  getToken: () => string | null,
  baseUrl = API_BASE_URL,
) {
  return async function request(
    path: string,
    options: RequestInit = {},
  ): Promise<unknown> {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (options.body) headers.set('Content-Type', 'application/json')
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, { ...options, headers })
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'AbortError'
      )
        throw error
      throw new ApiError(
        'Cannot reach the API. Check that the backend is running and allows this origin (CORS).',
        0,
      )
    }

    if (!response.ok) {
      let message = `Request failed (${response.status}). Please try again.`
      if (response.status === 401)
        message =
          'Your session is missing or expired. Add a valid access token in API settings.'
      if (response.status === 403)
        message = 'You do not have permission to perform this action.'
      throw new ApiError(message, response.status)
    }
    if (response.status === 204) return null
    try {
      return await response.json()
    } catch {
      throw new ApiError(
        'The API returned an invalid JSON response.',
        response.status,
      )
    }
  }
}
