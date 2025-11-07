import axios from 'axios'

export function getApiErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined
    return (data?.message && String(data.message)) || err.message || fallback
  }
  if (err instanceof Error) return err.message || fallback
  return fallback
}
