import { supabase } from '@/lib/supabase'

/**
 * Wrapper around fetch that automatically includes the Supabase JWT
 * in the Authorization header. Use this for all authenticated API calls.
 *
 * Usage:
 *   const res = await authFetch('/api/score', {
 *     method: 'POST',
 *     body: JSON.stringify({ action: '...' }),
 *   })
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
