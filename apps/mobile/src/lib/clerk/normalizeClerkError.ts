// src/utils/normalizeClerkError.ts
type NormalizedError = {
  code?: string
  message: string
  fieldErrors?: Record<string, string> // e.g. { email: "Already in use" }
  raw?: unknown // keep for logging
}

export function normalizeClerkError(err: unknown): NormalizedError {
  // Clerk often returns { errors: [{ code, message, longMessage, meta: { param_name } }] }
  const asAny = err as any

  // Case 1: standard Clerk error array
  if (asAny?.errors && Array.isArray(asAny.errors)) {
    const first = asAny.errors[0]
    const fieldErrors: Record<string, string> = {}

    for (const e of asAny.errors) {
      const field = e?.meta?.param_name || e?.meta?.parameter || e?.meta?.field
      if (field)
        fieldErrors[field] = e.longMessage ?? e.message ?? 'Invalid value'
    }

    return {
      code: first?.code,
      message:
        first?.longMessage ??
        first?.message ??
        'Something went wrong. Please try again.',
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
      raw: err,
    }
  }

  // Case 2: network / unknown
  if (asAny?.message && typeof asAny.message === 'string') {
    return { message: asAny.message, raw: err }
  }

  return { message: 'Unexpected error. Please try again.', raw: err }
}
