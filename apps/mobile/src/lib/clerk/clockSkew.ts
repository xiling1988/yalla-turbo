// src/lib/clockSkew.ts
export class PossibleClockSkewError extends Error {
  constructor(
    msg = 'We couldn’t validate your session. Check your device time and try again. (PossibleClockSkewError)'
  ) {
    super(msg)
    this.name = 'PossibleClockSkewError'
  }
}

/**
 * Returns a timestamp (ms) you can attach to a request, then compare when it fails.
 */
export function markTokenFreshness(): number {
  return Date.now()
}

/**
 * If the response failed *immediately* after acquiring a fresh token, warn about clock skew.
 * Tweak the threshold as you like (e.g., 5s).
 */
export function maybeClockSkew(
  tokenFetchedAtMs: number,
  responseStatus?: number,
  thresholdMs = 5000
): boolean {
  if (!responseStatus) return false
  const elapsed = Date.now() - tokenFetchedAtMs
  return (
    (responseStatus === 401 || responseStatus === 403) && elapsed <= thresholdMs
  )
}
