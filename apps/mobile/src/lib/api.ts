// src/lib/api.ts
import { Platform } from 'react-native'
import { getClerkInstance } from '@clerk/clerk-expo'

/** ===== Host resolution (keeps your Android 10.0.2.2 fix) ===== */
function resolveLocalBase(url: string) {
  if (!url.startsWith('http://localhost')) return url
  return Platform.OS === 'android' ? url.replace('localhost', '10.0.2.2') : url
}
const BASE = resolveLocalBase(process.env.EXPO_PUBLIC_API_URL || '')
// Log API configuration at module load (helps debug connection issues)
console.log('[API] 🔧 API Configuration:', {
  rawUrl: process.env.EXPO_PUBLIC_API_URL || '(not set)',
  resolvedBase: BASE || '(empty)',
  platform: Platform.OS,
})

// Lazy getter - don't call getClerkInstance() at module load time!
// This prevents Clerk from being initialized before ClerkProvider renders with resourceCache
// Clerk uses singleton pattern - if initialized early, resourceCache won't be used
const getClerk = () => getClerkInstance()

/** ===== Error classes ===== */
export class SessionExpiredError extends Error {
  constructor(msg = 'Your session expired. Please sign in again.') {
    super(msg)
    this.name = 'SessionExpiredError'
  }
}
export class PossibleClockSkewError extends Error {
  constructor(
    msg = 'We couldn’t validate your session. Please ensure your device time is set automatically. (PossibleClockSkewError)'
  ) {
    super(msg)
    this.name = 'PossibleClockSkewError'
  }
}

/** ===== Global 401/403 handler hook ===== */
type UnauthorizedReason = 'expired' | 'forbidden' | 'clockSkew' | 'unknown'
type UnauthorizedHandler = (reason: UnauthorizedReason) => void
let onUnauthorized: UnauthorizedHandler | null = null
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler
}

/** ===== JWT token helper (Clerk) ===== */
const JWT_TEMPLATE = 'yallasana'

// Wait for Clerk session to be available during initialization
// Returns true if session becomes available, false if timeout
async function waitForSession(
  maxWaitMs = 2000,
  intervalMs = 100
): Promise<boolean> {
  const Clerk = getClerk() // Get Clerk instance lazily
  if (Clerk.session) return true

  const startTime = Date.now()
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
    if (Clerk.session) return true
  }
  return false
}

async function getApiToken(): Promise<string> {
  const Clerk = getClerk() // Get Clerk instance lazily

  // During app initialization/reopening, Clerk.session might be null temporarily
  // while the session is being restored from tokenCache. Wait a bit for it to restore.
  if (!Clerk.session) {
    // Wait up to 2 seconds for session to be restored from tokenCache
    const sessionAvailable = await waitForSession(2000, 100)
    if (!sessionAvailable) {
      // Session still not available after waiting - treat as expired
      // Don't trigger onUnauthorized here (let HTTP 401 trigger it if needed)
      throw new SessionExpiredError()
    }
  }

  // Try template first, but swallow template-not-found errors
  try {
    const templated = await Clerk.session!.getToken({ template: JWT_TEMPLATE })
    if (templated) return templated
  } catch {
    // ignore and fall back below
  }

  // Try default token
  const token = await Clerk.session!.getToken() // default Clerk JWT
  if (!token) {
    // If getToken returns null, session is expired
    // This shouldn't happen if Clerk is fully loaded, but we handle it gracefully
    throw new SessionExpiredError()
  }
  return token
}

/** ===== Clock skew helpers ===== */
function markNow() {
  return Date.now()
}
// Disabled for MVP: clock skew detection was too aggressive
// For production, re-enable with a more lenient threshold (e.g., 2000ms)
function isMaybeClockSkew(
  _tokenFetchedAt: number | undefined,
  _status?: number
) {
  // MVP: Disable clock skew detection - treat all 401/403 as normal auth errors
  return false
  // Original logic (commented for reference):
  // if (!tokenFetchedAt || !status) return false
  // const elapsed = Date.now() - tokenFetchedAt
  // return (status === 401 || status === 403) && elapsed <= thresholdMs
}

/** ===== API function (typed) ===== */
export type ApiInit = RequestInit & {
  /** Attach Clerk JWT automatically */
  auth?: boolean
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  // Validate BASE URL
  if (!BASE || BASE.trim() === '') {
    const error = new Error(
      'API URL is not configured. Please set EXPO_PUBLIC_API_URL environment variable.'
    )
    error.name = 'ConfigurationError'
    throw error
  }

  // Construct URL - handle empty path (root endpoint)
  const cleanPath = path.replace(/^\/+/, '')
  const url = cleanPath ? `${BASE}/${cleanPath}` : BASE

  console.log('[API] 🔄 Making request:', {
    method: init.method || 'GET',
    url,
    path,
    base: BASE,
    hasAuth: !!init.auth,
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  // If auth is requested, fetch a fresh token and attach it
  let tokenFetchedAt: number | undefined
  if (init.auth) {
    tokenFetchedAt = markNow()
    try {
      const token = await getApiToken()
      headers.Authorization = `Bearer ${token}`
    } catch (e) {
      // No session / cannot get token → treat as expired and surface globally
      if (e instanceof SessionExpiredError) {
        onUnauthorized?.('expired')
      } else {
        onUnauthorized?.('unknown')
      }
      throw e
    }
  }

  let res: Response
  const startTime = Date.now()
  try {
    // Add timeout to fetch (default is 60s, but we'll make it explicit)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('[API] ❌ Request timeout after 15s:', {
        url,
        method: init.method || 'GET',
      })
      controller.abort()
    }, 15000) // 15 second timeout

    try {
      res = await fetch(url, { ...init, headers, signal: controller.signal })
      clearTimeout(timeoutId)
      const duration = Date.now() - startTime
      console.log('[API] ✅ Request completed:', {
        url,
        method: init.method || 'GET',
        status: res.status,
        duration: `${duration}ms`,
      })
    } catch (abortError) {
      clearTimeout(timeoutId)
      if (abortError instanceof Error && abortError.name === 'AbortError') {
        const timeoutError = new Error(
          `Request timed out after 15 seconds. Cannot connect to ${BASE}.\n\n` +
            `Please check:\n` +
            `1. The API server is running on ${BASE}\n` +
            `2. Your device and development machine are on the same network\n` +
            `3. The IP address ${BASE.split('//')[1]?.split(':')[0]} is correct\n` +
            `4. No firewall is blocking the connection`
        )
        timeoutError.name = 'NetworkError'
        throw timeoutError
      }
      throw abortError
    }
  } catch (fetchError) {
    const duration = Date.now() - startTime
    // Handle network errors (connection refused, timeout, etc.)
    const errorMessage =
      fetchError instanceof Error ? fetchError.message : String(fetchError)

    console.error('[API] ❌ Request failed:', {
      url,
      method: init.method || 'GET',
      duration: `${duration}ms`,
      error: errorMessage,
      errorName: fetchError instanceof Error ? fetchError.name : 'Unknown',
    })

    // Check for common network error patterns
    if (
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('Failed to connect') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out')
    ) {
      const networkError = new Error(
        `Cannot connect to server at ${BASE}.\n\n` +
          `Please check:\n` +
          `1. Your device is on the same network as your development machine\n` +
          `2. The API server is running (check http://${BASE.split('//')[1]?.split(':')[0]}:3000)\n` +
          `3. EXPO_PUBLIC_API_URL is set correctly (current: ${BASE})`
      )
      networkError.name = 'NetworkError'
      throw networkError
    }

    // Re-throw other errors as-is
    throw fetchError
  }

  if (!res.ok) {
    // Try to read error body
    const text = await res.text().catch(() => '')
    // Detect clock skew: fresh token + immediate 401/403
    if (isMaybeClockSkew(tokenFetchedAt, res.status)) {
      onUnauthorized?.('clockSkew')
      throw new PossibleClockSkewError()
    }
    // Normal unauthorized/forbidden handling
    if (res.status === 401) onUnauthorized?.('expired')
    else if (res.status === 403) onUnauthorized?.('forbidden')
    else if (!res.status) onUnauthorized?.('unknown')

    // Prefer JSON error message if present
    try {
      const json = text ? JSON.parse(text) : null
      const msg = json?.message ?? json?.error ?? (text || `HTTP ${res.status}`)
      throw new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`)
    } catch {
      throw new Error(text || `HTTP ${res.status}`)
    }
  }

  // Return JSON (or empty)
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return (await res.json()) as T
  }
  // If endpoint returns no body
  return undefined as unknown as T
}

/** ===== Convenience helpers for common verbs ===== */
export const apiGet = <T>(path: string, init?: ApiInit) =>
  api<T>(path, { method: 'GET', ...init })
export const apiPost = <T>(path: string, body?: unknown, init?: ApiInit) =>
  api<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  })
export const apiPatch = <T>(path: string, body?: unknown, init?: ApiInit) =>
  api<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  })
export const apiDelete = <T>(path: string, init?: ApiInit) =>
  api<T>(path, { method: 'DELETE', ...init })

// Note: Unauthorized handler should be set in app/_layout.tsx
// No default handler here to avoid conflicts
