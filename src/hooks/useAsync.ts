import { useCallback, useEffect, useState } from 'react'

export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null
    error: string | null
    loading: boolean
  }>({
    data: null,
    error: null,
    loading: true,
  })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    // Reset data when the service or route changes, so live and demo records never mix.
    setState({ data: null, error: null, loading: true }) // eslint-disable-line react-hooks/set-state-in-effect
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, error: null, loading: false })
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            data: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.',
          })
      },
    )
    return () => controller.abort()
  }, [load, attempt])

  return { ...state, retry }
}
